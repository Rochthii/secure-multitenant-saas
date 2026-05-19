# Hướng dẫn Cài đặt Đăng nhập bằng Google qua Supabase

Quá trình này hoàn toàn miễn phí và chia làm 3 giai đoạn: Tạo ứng dụng trên Google, Kết nối với Supabase, và Cấu hình Redirect.

## Giai đoạn 1: Lấy `Client ID` và `Client Secret` từ Google Cloud

1. Truy cập vào **[Google Cloud Console](https://console.cloud.google.com/)** (đăng nhập bằng tài khoản Gmail của bạn/chi nhánh).
2. Ở trên cùng bên trái, bấm vào menu **"Select a project"** (hoặc chọn 1 Project có sẵn như "My First Project"). 
3. Ở thanh menu bên trái (hoặc tìm kiếm), chọn **APIs & Services** -> **OAuth consent screen** (Màn hình chấp thuận OAuth).
    - Chọn **"External"** (Bên ngoài) -> Nhấn **Create**.
    - Điền các thông tin bắt buộc:
        - **App name**: Tên hiển thị khi người dùng đăng nhập (VD: `Chi nhánh Chantarangsay`).
        - **User support email**: Email của bạn.
        - **Developer contact information**: Email của bạn.
    - Cuộn xuống dưới cùng và bấm **"Save and Continue"** liên tục cho đến khi hoàn tất.
4. Chuyển sang tab **"Credentials"** (Thông tin xác thực) ở menu bên trái.
    - Bấm **"+ CREATE CREDENTIALS"** ở trên cùng.
    - Chọn **"OAuth client ID"**.
    - Mục **Application type** chọn: **"Web application"**.
    - Đặt tên bất kỳ (ví dụ: `Web Client`).
    - Lấy link callback từ Supabase:
        - Mở một tab trình duyệt khác, vào **[Supabase Dashboard](https://supabase.com/dashboard/)** -> Chọn dự án của bạn -> **Authentication** -> **Providers** -> **Google**. 
        - Copy đường link ở dòng **"Callback URL (for OAuth)"** (Thường có dạng `https://<project_id>.supabase.co/auth/v1/callback`).
    - Quay lại màn hình Google Cloud:
        - Ở mục **"Authorized redirect URIs"**, bấm **ADD URI** và dán đường link vừa copy bên trên vào.
    - Bấm **Create**.
5. Màn hình Google sẽ hiện ra Bảng thông báo. Sao chép 2 dòng:
    - **Client ID** 
    - **Client Secret** 

## Giai đoạn 2: Bật Đăng nhập Google trên Supabase

1. Mở lại tab bên **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Google**.
2. Bật công tắc kích hoạt (**Enable Google auth**).
3. Paste **Client ID** và **Client Secret** vừa copy ở biểu mẫu Google vào 2 ô tương ứng.
4. Bật nút **"Enable Sign in with Google (id_token)"** ở dưới cùng.
5. Bấm nút **Save**.

## Giai đoạn 3 (CỰC KỲ QUAN TRỌNG): Cấu hình Site URL Redirect

Để lỗi đăng nhập không bị văng thẳng ra trang chủ mà không xử lý đăng nhập, bạn **bắt buộc** phải gán Redirect URL. Điểm hay là bạn có thể cấu hình sẵn cho cả dự án Tương lai.

1. Vào **Supabase Dashboard** -> Mục **Authentication** -> Kéo xuống chọn **URL Configuration** (hoặc **Site URL**).
2. Tại ô **Site URL**, nhập đường link trang chủ của bạn (Ưu tiên link Production chính thức, VD: `https://chantarangsay.org` hoặc `https://chua-chantarangsay-new.vercel.app`).
3. Tại mục **Redirect URLs**, bạn bấm **Add URL** và KHUYÊN DÙNG dán tất cả các đường link sau đây (bạn có thể dán nhiều dòng để đón đầu tương lai):
   - `http://localhost:3000/auth/callback` (Để bạn test code trên máy tính của bạn)
   - `https://chua-chantarangsay-new.vercel.app/auth/callback` (Để chạy tạm thời bản thử nghiệm Vercel)
   - `https://chantarangsay.org/auth/callback` (Tên miền chính thức tương lai)
   
4. Bấm **Save**.

5. **(QUAN TRỌNG NHẤT) KIỂM TRA LẠI GOOGLE CLOUD CONSOLE:**
   Quay trở lại **Google Cloud Console**, vô lại **Credentials** -> **OAuth Client**. 
   - ❌ Ở mục **"Authorized redirect URIs"**: **TUYỆT ĐỐI KHÔNG** được dán các link `localhost` hay `vercel.app` vào đây. Việc chuyển hướng website là do Supabase lo (bạn đã cài ở bước 3 bên trên rồi).
   - ✅ Mục **"Authorized redirect URIs"** bên Google chỉ được phép chứa **DUY NHẤT 1 ĐƯỜNG LINK CALLBACK CỦA SUPABASE**, đó là:
     `https://yhwbbndnwvxlhbhnhnvj.supabase.co/auth/v1/callback`
   - Bấm **SAVE** lại.

---
Tuyệt vời! Hệ thống đăng nhập bằng Google phía BE đã xong hoàn toàn 100%. Lúc này khi trải nghiệm Google Sign In trên nhiều tài khoản sẽ không bao giờ xuất hiện lỗi `redirect_uri_mismatch` nữa.
