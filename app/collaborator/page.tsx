import { redirect } from 'next/navigation';

export default function CollaboratorDashboard() {
    // Redirect CTV vào trang quản lý bài của họ
    redirect('/collaborator/news-manager');
}
