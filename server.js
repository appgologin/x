import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Khởi tạo các biến toàn cục cần thiết
let savedData = null; // lưu token, api_key, tmproxytoken đã nhập
let mID = null; // Biến lưu ID
let mStart = 'Server is running'; // Nội dung mặc định khi truy cập /

// Hàm giả lập pageReload và updateStatus (cần được định nghĩa đầy đủ)
async function pageReload() {
    console.log('Page reload triggered');
    // Thêm logic reload page của bạn ở đây
}

async function updateStatus() {
    console.log('Updating status...');
    // Thêm logic cập nhật trạng thái của bạn ở đây
}

// Khởi động server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

// Các tác vụ định kỳ
setInterval(async () => {
    await pageReload();
}, 30 * 60 * 1000);

setInterval(async () => {
    await updateStatus();
}, 60000);

// Các route
app.get('/reload', async (req, res) => {
    await pageReload();
    res.end('Reload Success');
});

// Trang chủ: hiển thị form hoặc data đã lưu
app.get('/', (req, res) => {
  // Xử lý logic cho mID nếu cần
  if (mID == null) {
    try {
      let url = req.query.url;
      if (!url) {
        let host = req.hostname;
        if (host.endsWith('onrender.com')) {
          url = host.replace('.onrender.com', '');
        }
      }
      if (url && url != 'localhost') {
        mID = url;
      }
    } catch (error) {
      console.error('Error in / route:', error);
    }
  }

  // Nếu chưa có dữ liệu đăng nhập, hiển thị form
  if (!savedData) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Create Profile - Nhập liệu</title>
        <style>
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: #1e1e1e;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 500px;
          }
          h1 {
            color: #4caf50;
            text-align: center;
            margin-bottom: 30px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }
          input[type="text"],
          input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #333;
            border-radius: 4px;
            background-color: #2d2d2d;
            color: #e0e0e0;
            font-size: 16px;
            box-sizing: border-box;
          }
          button {
            width: 100%;
            padding: 14px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
          }
          button:hover {
            background-color: #45a049;
          }
          .status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
          }
          .success {
            background-color: #4caf50;
            color: white;
          }
          .error {
            background-color: #f44336;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Create Profile</h1>
          <form id="loginForm" action="/save-data" method="post">
            <div class="form-group">
              <label for="token">Token:</label>
              <input type="text" id="token" name="token" required />
            </div>
            <div class="form-group">
              <label for="api_key">API Key:</label>
              <input type="text" id="api_key" name="api_key" required />
            </div>
            <div class="form-group">
              <label for="tmproxytoken">Danh sách TMP Proxy Tokens:</label>
              <div style="background: #2a2a2a; border-radius: 4px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #888; font-size: 13px;">
                  <span>Nhập mỗi token một dòng</span>
                  <span id="tokenCount">0 token</span>
                </div>
                <textarea 
                  id="tmproxytoken" 
                  name="tmproxytoken" 
                  rows="8" 
                  style="width: 100%; padding: 10px; border: 1px solid #444; border-radius: 4px; background-color: #1e1e1e; color: #e0e0e0; font-family: monospace;"
                  placeholder="token_cua_ban_1
token_cua_ban_2
token_cua_ban_3"
                  required
                  oninput="updateTokenCount()"
                ></textarea>
                <div style="font-size: 12px; color: #666; margin-top: 8px; display: flex; justify-content: space-between;">
                  <span>Ví dụ: token123, token456, ...</span>
                  <span id="tokenExample" style="cursor: pointer; color: #4caf50;" onclick="useExample()">Dùng ví dụ</span>
                </div>
              </div>
            </div>
            <script>
              function updateTokenCount() {
                const textarea = document.getElementById('tmproxytoken');
                const count = textarea.value.split('\n').filter(t => t.trim().length > 0).length;
                document.getElementById('tokenCount').textContent = count + (count <= 1 ? ' token' : ' tokens');
              }
              
              function useExample() {
                const example = 'token1\ntoken2\ntoken3\n';
                const textarea = document.getElementById('tmproxytoken');
                textarea.value = example;
                updateTokenCount();
              }
              
              // Cập nhật đếm token khi trang tải xong
              document.addEventListener('DOMContentLoaded', updateTokenCount);
            </script>
            <button type="submit">Lưu dữ liệu</button>
          </form>
          <div id="status" class="status" style="display: none;"></div>
        </div>
        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
              const response = await fetch('/save-data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });
              
              const result = await response.json();
              const statusDiv = document.getElementById('status');
              statusDiv.style.display = 'block';
              
              if (response.ok) {
                statusDiv.className = 'status success';
                statusDiv.textContent = 'Đã lưu dữ liệu thành công!';
                setTimeout(() => window.location.reload(), 1000);
              } else {
                statusDiv.className = 'status error';
                statusDiv.textContent = result.error || 'Có lỗi xảy ra';
              }
            } catch (error) {
              console.error('Error:', error);
              const statusDiv = document.getElementById('status');
              statusDiv.style.display = 'block';
              statusDiv.className = 'status error';
              statusDiv.textContent = 'Lỗi kết nối';
            }
          });
        </script>
      </body>
      </html>
    `);
  } else {
    // Nếu đã đăng nhập, hiển thị thông báo đơn giản
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Create Profile</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .success { 
            color: #4CAF50; 
            font-size: 18px; 
            margin-bottom: 20px;
          }
          .info {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tạo Profile</h1>
          <div class="success">Đã lưu thông tin đăng nhập!</div>
          <div class="info">
            <p>Bạn có thể sử dụng API để tạo profile mới.</p>
            <p>Ví dụ: <code>GET /create-profile</code></p>
          </div>
          <form action="/clear-data" method="post">
            <button type="submit" style="background-color: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Xóa dữ liệu đã lưu</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

// Hàm random chữ cái đầu
function randomChar() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

// Hàm random name email
function randomName(length = 20) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = randomChar();
  for (let i = 1; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + '@hotmail.com';
}

// Hàm random password
function randomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const specials = ['@', '.'];
  let pwd = '';
  for (let i = 0; i < length - 2; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pwd += specials[Math.floor(Math.random() * specials.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];
  return pwd;
}

// Khởi tạo danh sách proxy và index hiện tại
let proxyList = [];
let currentProxyIndex = 0;

let currentTokenIndex = 0; // Theo dõi token hiện tại đang sử dụng

// Hàm lấy proxy từ một token cụ thể
async function fetchProxyFromToken(token, isNew = false) {
  try {
    let url, options = {};
    
    if (isNew) {
      // Lấy proxy mới
      url = `https://tmproxy.com/api/proxy/get-new-proxy?api_key=${token}&id_location=1&id_isp=1`;
    } else {
      // Lấy proxy hiện tại
      url = 'https://tmproxy.com/api/proxy/get-current-proxy';
      options = {
        method: 'POST',
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: token })
      };
    }

    const res = await fetch(url, options);
    const data = await res.json();
    
    if (data?.data?.https) {
      return {
        https: data.data.https,
        username: data.data.username || 'default_username',
        password: data.data.password || 'default_password',
        token: token,
        source: isNew ? 'new' : 'current'
      };
    }
    return null;
  } catch (error) {
    console.error(`Lỗi khi lấy proxy từ token ${token.substring(0, 5)}...:`, error.message);
    return null;
  }
}

// Hàm lấy proxy ưu tiên lấy proxy hiện tại, fallback lấy proxy mới, fallback proxy mặc định
async function getProxy(tmproxytoken) {
  const defaultProxy = {
    https: 'geo.floppydata.com:10080',
    username: 'username',
    password: 'password',
    source: 'default'
  };

  // Nếu đã có proxy trong danh sách, trả về proxy tiếp theo
  if (proxyList.length > 0) {
    const proxy = proxyList[currentProxyIndex];
    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    console.log(`Sử dụng proxy từ danh sách (${proxy.source}): ${proxy.https}`);
    return proxy;
  }

  // Nếu có nhiều token, thử lần lượt từng token
  const tokens = savedData?.tmproxytokens || [tmproxytoken];
  
  for (let i = 0; i < tokens.length; i++) {
    const currentTokenIdx = (currentTokenIndex + i) % tokens.length;
    const currentToken = tokens[currentTokenIdx];
    
    console.log(`Thử lấy proxy với token thứ ${currentTokenIdx + 1}/${tokens.length}`);
    
    // 1. Thử lấy proxy hiện tại
    let proxy = await fetchProxyFromToken(currentToken, false);
    
    // 2. Nếu không có proxy hiện tại thì lấy proxy mới
    if (!proxy) {
      console.log(`Không lấy được proxy hiện tại, thử lấy proxy mới...`);
      proxy = await fetchProxyFromToken(currentToken, true);
    }
    
    if (proxy) {
      proxyList.push(proxy);
      currentTokenIndex = (currentTokenIdx + 1) % tokens.length; // Chuyển sang token tiếp theo cho lần sau
      console.log(`Đã thêm ${proxy.source} proxy vào danh sách từ token ${currentTokenIdx + 1}: ${proxy.https}`);
      return proxy;
    }
    
    console.log(`Token thứ ${currentTokenIdx + 1} không lấy được proxy`);
  }

  // 3. Đã thử hết các token mà không lấy được proxy
  console.log('Đã thử tất cả token nhưng không lấy được proxy, sử dụng proxy mặc định');
  return defaultProxy;
}

// Hàm thêm proxy vào danh sách (có thể gọi từ nơi khác)
function addProxyToRotation(proxy) {
  if (proxy?.https) {
    proxyList.push(proxy);
    console.log('Đã thêm proxy vào danh sách quay vòng:', proxy.https);
    return true;
  }
  return false;
}

// Gọi API Google Apps Script để tạo profile
async function createProfileApi(token, api_key, profileData) {
  const baseUrl = 'https://script.google.com/macros/s/AKfycbwvAWoCyR9ggSIi4xkR8FR9ImWGgHwcE2dj0c5wWdc6CjWxJcGK1SBWA9trf09LTQiw5Q/exec';
  
  // Tạo URL với các tham số
  const url = new URL(baseUrl);
  const params = {
    proxy: profileData.proxy,
    name: profileData.name,
    note: profileData.note,
    token: token,
    api_key: api_key
  };
  
  // Thêm các tham số vào URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    console.log('\n=== REQUEST ===');
    console.log('URL:', url.toString());
    console.log('Method: GET');
    console.log('Params:', JSON.stringify(params, null, 2));
    
    const startTime = Date.now();
    const res = await fetch(url.toString());
    const responseTime = Date.now() - startTime;
    
    console.log('\n=== RESPONSE ===');
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Time: ${responseTime}ms`);
    
    // Đọc response dưới dạng text trước
    const text = await res.text();
    console.log('Raw Response:', text);
    
    // Thử parse JSON
    let data;
    try {
      data = text ? JSON.parse(text) : {};
      console.log('Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Không thể parse JSON từ response');
      console.error('Raw Response:', text);
      throw new Error(`Response không phải JSON: ${text.substring(0, 100)}...`);
    }
    
    // Kiểm tra kết quả
    if (data && data.success) {
      console.log('🎉 Tạo profile thành công!');
      console.log('ID:', data.id || 'Không có ID');
      return data;
    } else {
      console.error('❌ Tạo profile thất bại');
      console.error('Lỗi từ API:', data.error || 'Không có thông báo lỗi');
      throw new Error(data.error || 'Lỗi không xác định từ API');
    }
  } catch (error) {
    console.error('\n=== LỖI ===');
    console.error('Thông báo:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Trang chủ: hiển thị form hoặc data đã lưu
app.get('/', (req, res) => {
  if (!savedData) {
    // Chưa có dữ liệu lưu: hiển thị form
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Create Profile - Nhập liệu</title>
        <style>
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px;
          }
          form {
            background: #1f1f1f;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px #00bcd4;
            width: 320px;
          }
          label {
            display: block;
            margin-bottom: 12px;
          }
          input {
            width: 100%;
            padding: 8px;
            margin-top: 4px;
            border-radius: 5px;
            border: none;
            background: #333;
            color: #eee;
            font-size: 14px;
          }
          input:focus {
            outline: none;
            box-shadow: 0 0 8px #00bcd4;
          }
          button {
            background-color: #00bcd4;
            border: none;
            color: #121212;
            padding: 10px 18px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
            margin-right: 8px;
          }
          button:hover {
            background-color: #0097a7;
          }
          #buttons {
            display: flex;
            justify-content: flex-start;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <form id="profileForm" method="POST" action="/save-data">
          <label>Token: <input type="text" name="token" required /></label>
          <label>API Key: <input type="text" name="api_key" required /></label>
          <label>TMProxy Token: <input type="text" name="tmproxytoken" required /></label>
          <div id="buttons">
            <button type="submit">Save</button>
            <button type="reset" onclick="return false;">Reset</button>
          </div>
        </form>
      </body>
      </html>
    `);
  } else {
    // Có dữ liệu đã lưu: ẩn form, hiện data + nút reset
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Đã lưu dữ liệu</title>
        <style>
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px;
          }
          #savedData {
            background: #1f1f1f;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px #00bcd4;
            width: 320px;
            white-space: pre-wrap;
          }
          button {
            background-color: #00bcd4;
            border: none;
            color: #121212;
            padding: 10px 18px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
          }
          button:hover {
            background-color: #0097a7;
          }
        </style>
      </head>
      <body>
        <div id="savedData">${JSON.stringify(savedData, null, 2)}</div>
        <form method="POST" action="/reset-data">
          <button type="submit">Reset</button>
        </form>
      </body>
      </html>
    `);
  }
});

// Xử lý POST lưu dữ liệu form
app.post('/save-data', (req, res) => {
  const { token, api_key, tmproxytoken } = req.body;
  if (!token || !api_key || !tmproxytoken) {
    return res.status(400).json({ error: 'Thiếu token hoặc api_key hoặc tmproxytoken' });
  }
  
  // Nếu là nhiều token, chuyển thành mảng
  let tokens = [];
  if (typeof tmproxytoken === 'string') {
    tokens = tmproxytoken
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  } else if (Array.isArray(tmproxytoken)) {
    tokens = tmproxytoken;
  } else {
    tokens = [tmproxytoken];
  }
  
  if (tokens.length === 0) {
    return res.status(400).json({ error: 'Vui lòng nhập ít nhất một token proxy' });
  }
  
  savedData = {
    token,
    api_key,
    tmproxytoken: tokens[0], // Lưu token đầu tiên làm mặc định
    tmproxytokens: tokens    // Lưu toàn bộ danh sách tokens
  };
  
  res.json({ success: true });
});

// Xử lý POST reset dữ liệu
app.post('/reset-data', (req, res) => {
  savedData = null;
  res.redirect('/');
});

// API lấy dữ liệu đã lưu cho app ngoài
app.get('/get-saved-data', (req, res) => {
  if (!savedData) return res.status(404).json({ error: 'Chưa có dữ liệu lưu' });
  res.json(savedData);
});

// API tạo profile
app.get('/create-profile', async (req, res) => {
  if (!savedData) return res.status(400).json({ error: 'Chưa lưu dữ liệu token, api_key, tmproxytoken' });
  try {
    // Lấy proxy ưu tiên proxy hiện tại
    const proxyData = await getProxy(savedData.tmproxytoken);
    if (!proxyData) return res.status(500).json({ error: 'Lấy proxy thất bại' });

    // Tạo tên, mật khẩu, ghi chú
    const name = randomName();
    const password = randomPassword();
    const note = `${name}|${password}`;
    const proxyStr = `${proxyData.https}:${proxyData.username}:${proxyData.password}`;

    const profileData = { proxy: proxyStr, name, note };
    const apiResult = await createProfileApi(savedData.token, savedData.api_key, profileData);

    // Trả về kết quả dạng: profileId|note
    if (apiResult && apiResult.success && apiResult.profileId) {
      const cleanNote = note.replace(/[.,]/g, ''); // Xóa dấu . và , trong note
      return res.send(`${apiResult.profileId}|${cleanNote}`);
    }

    // Nếu không thành công, trả về lỗi
    res.status(400).json({
      success: false,
      error: 'Không thể tạo profile',
      details: apiResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// API riêng chỉ lấy proxy mới từ tất cả các token
app.get('/get-new-proxy', async (req, res) => {
  if (!savedData) return res.status(400).json({ error: 'Chưa lưu dữ liệu token, api_key, tmproxytoken' });
  
  const tokens = savedData.tmproxytokens || [savedData.tmproxytoken];
  const results = {
    success: 0,
    failed: 0,
    proxies: [],
    replaced: 0
  };
  
  // Lưu lại số lượng proxy cũ để thông báo
  const oldProxyCount = proxyList.length;
  
  // Xóa toàn bộ proxy cũ
  proxyList = [];
  currentProxyIndex = 0; // Reset lại chỉ số proxy hiện tại
  results.replaced = oldProxyCount;
  
  console.log(`Đã xóa ${oldProxyCount} proxy cũ, bắt đầu lấy proxy mới từ ${tokens.length} token...`);
  
  // Duyệt qua tất cả các token để lấy proxy mới
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    console.log(`[${i+1}/${tokens.length}] Đang lấy proxy mới từ token ${token.substring(0, 5)}...`);
    
    try {
      const proxy = await fetchProxyFromToken(token, true); // true để lấy proxy mới
      if (proxy) {
        // Thêm proxy vào danh sách quay vòng
        proxyList.push(proxy);
        results.proxies.push({
          token: `Token ${i+1}`,
          proxy: proxy.https,
          source: proxy.source
        });
        results.success++;
        console.log(`  ✓ Đã thêm proxy mới: ${proxy.https}`);
      } else {
        results.failed++;
        console.log(`  ✗ Không lấy được proxy từ token ${i+1}`);
      }
    } catch (error) {
      results.failed++;
      console.error(`  ✗ Lỗi khi lấy proxy từ token ${i+1}:`, error.message);
    }
  }
  
  // Cập nhật lại index để lần sau bắt đầu từ token tiếp theo
  if (tokens.length > 0) {
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
  }
  
  // Trả về kết quả
  if (results.success > 0) {
    return res.json({
      success: true,
      message: `Đã thay thế ${results.replaced} proxy cũ bằng ${results.success} proxy mới`,
      details: {
        old_proxies_replaced: results.replaced,
        new_proxies_added: results.success,
        total_proxies: proxyList.length,
        proxies: results.proxies
      }
    });
  } else {
    return res.status(400).json({
      success: false,
      error: `Đã xóa ${results.replaced} proxy cũ nhưng không lấy được proxy mới từ bất kỳ token nào`,
      details: results
    });
  }
});
