import os
import re
import datetime
from flask import Flask, request, render_template_string, session, redirect, url_for
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Şifreleri .env'den çekiyoruz
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'yedek_anahtar_123')

# Görsellerin kaydedileceği ana dizin
BASE_UPLOAD_FOLDER = 'pictures'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image_to_folder(file_storage, subfolder):
    """
    Dosyayı güvenli hale getirir ve belirtilen alt klasöre kaydeder.
    Örn: pictures/blog/foto.webp, pictures/projects/kamera.png
    """
    if not file_storage or file_storage.filename == '':
        return None

    if allowed_file(file_storage.filename):
        filename = secure_filename(file_storage.filename)

        # Target folder: pictures/blog, pictures/projects veya pictures/gallery
        target_dir = os.path.join(BASE_UPLOAD_FOLDER, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        save_path = os.path.join(target_dir, filename)
        file_storage.save(save_path)

        # HTML içinde kullanılacak bağıl yol (örn: pictures/blog/resim.jpg)
        return f"pictures/{subfolder}/{filename}".replace("\\", "/")
    return None

def format_blog_content(raw_text):
    """Düz metni okunaklı HTML paragraflarına ve kod bloklarına dönüştürür."""
    if not raw_text:
        return ""

    # Paragraflara böl (çift alt satıra göre)
    paragraphs = [p.strip() for p in raw_text.split('\n\n') if p.strip()]
    formatted_paragraphs = []

    for p in paragraphs:
        # Eğer zaten bir HTML elementi içeriyorsa dokunma
        if p.startswith('<p>') or p.startswith('blockquote') or p.startswith('<figure>'):
            formatted_paragraphs.append(p)
            continue

        # Hex kodları (0x99CA38 vb.) otomatik <code> içine al
        p = re.sub(r'(0x[0-9A-Fa-f]{6})', r'<code style="background: rgba(255,255,255,0.08); color: var(--cyan, #00f0ff); padding: 3px 8px; border-radius: 4px; font-family: var(--mono); border: 1px solid rgba(255,255,255,0.1);">\1</code>', p)

        formatted_paragraphs.append(f'<p style="margin-bottom: 20px;">{p}</p>')

    return '\n'.join(formatted_paragraphs)


# --- HTML ŞABLONLARI ---

LOGIN_HTML = """
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Sistem Girişi</title>
  <style>
    body { background: #05070a; color: #00e5ff; font-family: 'IBM Plex Mono', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .login-box { background: #0d1118; border: 1px solid rgba(0,229,255,0.25); padding: 40px; border-radius: 8px; width: 100%; max-width: 400px; }
    input, button { width: 100%; margin-bottom: 20px; padding: 12px; background: #111620; border: 1px solid rgba(0,229,255,0.25); color: #fff; font-family: inherit; box-sizing: border-box; }
    button { background: #00e5ff; color: #05070a; cursor: pointer; font-weight: bold; border: none; }
    button:hover { background: #e6bd73; }
  </style>
</head>
<body>
  <div class="login-box">
    <h2>// YETKİLENDİRME</h2>
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="Kullanıcı Adı" required>
      <input type="password" name="password" placeholder="Şifre" required>
      <button type="submit">SİSTEME GİR</button>
    </form>
    {% if error %}<p style="color: #ff4444;">{{ error }}</p>{% endif %}
  </div>
</body>
</html>
"""

ADMIN_HTML = """
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Sistem Kontrol Paneli</title>
  <style>
    body { background: #05070a; color: #edf2f7; font-family: 'IBM Plex Mono', monospace; padding: 40px; max-width: 900px; margin: 0 auto; }
    h2 { color: #00e5ff; border-bottom: 1px solid rgba(0,229,255,0.2); padding-bottom: 10px; display: flex; justify-content: space-between; }
    a.logout { color: #ff4444; text-decoration: none; font-size: 1rem; }
    .box { background: #0d1118; border: 1px solid rgba(0,229,255,0.12); padding: 20px; margin-bottom: 30px; border-radius: 8px; }
    h3 { color: #e6bd73; margin-top: 0; }
    input, textarea, button { display: block; width: 100%; margin-bottom: 15px; padding: 12px; background: #111620; border: 1px solid rgba(0,229,255,0.25); color: #fff; font-family: inherit; box-sizing: border-box; }
    button { background: #00e5ff; color: #05070a; cursor: pointer; font-weight: bold; text-transform: uppercase; border: none; }
    button:hover { background: #e6bd73; }
    .note { font-size: 0.8rem; color: #718094; margin-top: -10px; margin-bottom: 15px; display: block; }
  </style>
</head>
<body>
  <h2><span>// YÖNETİM TERMİNALİ</span> <a href="/logout" class="logout">[ Çıkış Yap ]</a></h2>

  {% if msg %}
  <div style="background: #0083a3; color: white; padding: 15px; margin-bottom: 20px; border-radius: 4px;">{{ msg }}</div>
  {% endif %}

  <!-- BLOG EKLEME -->
  <div class="box">
      <h3>> Yeni Blog Yazısı Ekle</h3>
      <span class="note">İpucu: Yazının içine [FOTO] eklersen fotoğraf oraya yerleşir. Eklemeyi unutursan yazının başında çıkar.</span>
      <form action="/add_blog" method="post" enctype="multipart/form-data">
        <input type="text" name="title" placeholder="Yazı Başlığı (Örn: Gömülü Sistemler)" required>
        <input type="text" name="slug" placeholder="URL Adı (Örn: gomulu-sistemler)" required>
        <input type="text" name="summary" placeholder="Kısa Özet (Blog listesinde görünecek)" required>
        <textarea name="content" rows="8" placeholder="Metninizi paragraflar arası bir satır boşluk bırakarak yazın..." required></textarea>
        <input type="file" name="blog_img" accept="image/png, image/jpeg, image/webp">
        <button type="submit">Yazıyı Yayınla</button>
      </form>
  </div>

  <!-- PROJE EKLEME -->
  <div class="box">
      <h3>> Portföye Proje Ekle</h3>
      <form action="/add_project" method="post" enctype="multipart/form-data">
        <input type="text" name="name" placeholder="Proje Adı (Örn: Dünya Masa Modülü)" required>
        <input type="text" name="cat" placeholder="Kategori (Örn: CAD · SolidWorks)" required>
        <input type="text" name="idx" placeholder="Proje Kodu (Örn: PRJ-005)" required>
        <input type="text" name="link" placeholder="Proje Linki (PDF veya GitHub)" required>
        <input type="file" name="proj_img" accept="image/png, image/jpeg, image/webp" required>
        <button type="submit">Projeyi Ekle</button>
      </form>
  </div>

  <!-- GALERİ EKLEME -->
  <div class="box">
      <h3>> Galeriye Fotoğraf Ekle</h3>
      <form action="/add_gallery" method="post" enctype="multipart/form-data">
        <input type="text" name="label" placeholder="Etiket (Örn: IMG_007)" required>
        <input type="file" name="gal_img" accept="image/png, image/jpeg, image/webp" required>
        <button type="submit">Galeriye Ekle</button>
      </form>
  </div>
</body>
</html>
"""

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Volkan Tuncer</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/components.js"></script>
</head>
<body>
  <canvas id="space-canvas"></canvas>
  <div class="side-stars side-stars-left"></div><div class="side-stars side-stars-right"></div>
  <div class="scroll-progress"><span></span></div>
  <canvas id="cur-ripple-canvas"></canvas><div id="cur-wrap"><div id="cur-ring"></div><div id="cur-dot"></div></div>

  <site-header></site-header>

  <div class="page" style="display:flex; flex-direction:column; min-height:100vh;">
    <div class="page-header reveal d1">
      <h1>{title}</h1>
      <p style="font-family: var(--mono); color: var(--cyan); margin-top: 8px;">{date}</p>
    </div>

    <section class="section" style="flex:1;">
      <div class="section-inner" style="padding-top: 20px; max-width: 800px; margin: 0 auto;">
        <article class="blog-content reveal d2" style="font-size: 1.05rem; color: var(--fg2, #ccc); line-height: 1.8;">
          {content}
        </article>
      </div>
    </section>

    <site-footer></site-footer>
  </div>

  <script src="js/main.js"></script>
</body>
</html>
"""

# --- YARDIMCI FONKSİYONLAR ---

def is_logged_in():
    return session.get('logged_in') is True

def get_turkish_date():
    now = datetime.datetime.now()
    aylar = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylul", "Ekim", "Kasım", "Aralık"]
    return f"{now.day} {aylar[now.month]} {now.year}"

def inject_html(filename, marker, injection_code):
    """Belirtilen HTML dosyasını okur, markerı bulur ve hemen altına yeni kodu ekler."""
    if not os.path.exists(filename): return False
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    if marker in content:
        content = content.replace(marker, marker + "\n" + injection_code, 1)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# --- ROTLAR ---

@app.route('/')
def index():
    if not is_logged_in(): return redirect(url_for('login'))
    msg = request.args.get('msg')
    return render_template_string(ADMIN_HTML, msg=msg)

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] == os.getenv('ADMIN_USER') and request.form['password'] == os.getenv('ADMIN_PASS'):
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            error = "Erişim Reddedildi: Hatalı giriş."
    return render_template_string(LOGIN_HTML, error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/add_blog', methods=['POST'])
def add_blog():
    if not is_logged_in(): return redirect(url_for('login'))

    title = request.form['title']
    slug = secure_filename(request.form['slug']) + '.html'
    summary = request.form['summary']
    raw_content = request.form['content']
    date_str = get_turkish_date()

    # Fotoğraf İşleme -> pictures/blog/ altına kaydeder
    img_html = ""
    if 'blog_img' in request.files:
        file_path = save_image_to_folder(request.files['blog_img'], 'blog')
        if file_path:
            img_html = f'''
          <figure style="margin: 0 0 30px 0;">
            <img src="{file_path}" alt="{title}" style="width:100%; height:auto; border-radius:12px; border:1px solid var(--line2, #333); box-shadow: 0 10px 30px rgba(0,0,0,0.5); display:block;">
          </figure>'''

    # İçeriği tipografik HTML formatına çevir
    formatted_body = format_blog_content(raw_content)

    if '[FOTO]' in formatted_body:
        final_content = formatted_body.replace('[FOTO]', img_html)
    else:
        final_content = img_html + "\n" + formatted_body

    # Sayfayı Üret
    full_html = PAGE_TEMPLATE.format(title=title, date=date_str, content=final_content)
    with open(slug, 'w', encoding='utf-8') as f:
        f.write(full_html)

    # blog.html listesine ekle
    card = f"""
          <a href="{slug}" class="blog-card">
            <span class="blog-date">{date_str}</span>
            <h3 class="blog-title">{title}</h3>
            <p class="blog-excerpt">{summary}</p>
          </a>"""
    inject_html('blog.html', '<div class="blog-grid reveal d2">', card)

    return redirect(url_for('index', msg=f'Blog başarıyla oluşturuldu: {slug}'))

@app.route('/add_project', methods=['POST'])
def add_project():
    if not is_logged_in(): return redirect(url_for('login'))

    name = request.form['name']
    cat = request.form['cat']
    idx = request.form['idx']
    link = request.form['link']

    # Proje resmi -> pictures/projects/ altına kaydeder
    file_path = save_image_to_folder(request.files['proj_img'], 'projects')
    if not file_path:
        return redirect(url_for('index', msg='Hata: Proje fotoğrafı yüklenemedi!'))

    card = f"""
          <a class="proj-card" href="{link}" target="_blank">
            <div class="proj-top-line"></div>
            <div class="proj-img-wrap"><img src="{file_path}" alt="{name}" class="proj-img"></div>
            <div class="proj-body">
              <div class="proj-meta"><span class="proj-idx">{idx}</span><div class="proj-sep"></div><span class="proj-cat">{cat}</span></div>
              <div class="proj-name">{name}</div>
              <div class="proj-cta">Projeye Git</div>
            </div>
          </a>"""

    inject_html('projeler.html', '<div class="proj-grid reveal d2">', card)
    return redirect(url_for('index', msg='Proje başarıyla eklendi.'))

@app.route('/add_gallery', methods=['POST'])
def add_gallery():
    if not is_logged_in(): return redirect(url_for('login'))

    label = request.form['label']

    # Galeri resmi -> pictures/gallery/ altına kaydeder
    file_path = save_image_to_folder(request.files['gal_img'], 'gallery')
    if not file_path:
        return redirect(url_for('index', msg='Hata: Galeri fotoğrafı yüklenemedi!'))

    card = f'<div class="gi"><a href="{file_path}" target="_blank"><img src="{file_path}" alt="{label}"><div class="gi-label">{label}</div></a></div>'
    inject_html('galeri.html', '<div class="gal-grid reveal d2">', card)

    return redirect(url_for('index', msg='Galeriye fotoğraf eklendi.'))

if __name__ == '__main__':
    app.run(port=5000, debug=True)
