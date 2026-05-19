import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

export default async function TestDbPage() {
    const supabase = await createClient();

    // Test query pages table
    const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*');

    // Test query specific page
    const { data: aboutPage, error: aboutError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'gioi-thieu')
        .single();

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">ðŸ” Database Test</h1>

            {/* Pages Table Test */}
            <section className="mb-12 p-6 bg-gray-100 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">ðŸ“„ All Pages</h2>
                {pagesError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Error:</p>
                        <pre className="text-sm overflow-auto">{JSON.stringify(pagesError, null, 2)}</pre>
                    </div>
                ) : (
                    <div>
                        <p className="mb-2"><strong>Total pages:</strong> {pages?.length || 0}</p>
                        <pre className="bg-white p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(pages, null, 2)}
                        </pre>
                    </div>
                )}
            </section>

            {/* About Page Test */}
            <section className="mb-12 p-6 bg-blue-100 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">ðŸ“– About Page (gioi-thieu)</h2>
                {aboutError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Error:</p>
                        <pre className="text-sm overflow-auto">{JSON.stringify(aboutError, null, 2)}</pre>
                    </div>
                ) : aboutPage ? (
                    <div>
                        <p className="mb-2">âœ… <strong>Found!</strong></p>
                        <div className="bg-white p-4 rounded mb-4">
                            <p><strong>ID:</strong> {(aboutPage as Page).id}</p>
                            <p><strong>Title VI:</strong> {(aboutPage as Page).title_vi}</p>
                            <p><strong>Slug:</strong> {(aboutPage as Page).slug}</p>
                            <p><strong>Status:</strong> {(aboutPage as Page).status}</p>
                            <p><strong>Content length:</strong> {(aboutPage as Page).content_vi?.length || 0} chars</p>
                        </div>
                        <details>
                            <summary className="cursor-pointer font-bold mb-2">View Full Data</summary>
                            <pre className="bg-white p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(aboutPage, null, 2)}
                            </pre>
                        </details>
                    </div>
                ) : (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <p className="font-bold">âš ï¸ No page found with slug "gioi-thieu"</p>
                    </div>
                )}
            </section>

            {/* Connection Info */}
            <section className="p-6 bg-green-100 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">ðŸ”Œ Connection Info</h2>
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
                <p><strong>Connected:</strong> {supabase ? 'âœ… Yes' : 'âŒ No'}</p>
            </section>
        </div>
    );
}

