// Verify GraphRAG V2 data
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  // Count entities
  const { count: entCount } = await supabase
    .from('dharma_entities')
    .select('*', { count: 'exact', head: true });
  
  // Count relations
  const { count: relCount } = await supabase
    .from('dharma_relations')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 GraphRAG V2 Data:`);
  console.log(`   Entities: ${entCount}`);
  console.log(`   Relations: ${relCount}`);

  // Test 1: Entity Search
  console.log(`\n🔍 Test 1: search_graph_entities(['Tứ Diệu Đế', 'Khổ'])`);
  const { data: entities, error: e1 } = await supabase
    .rpc('search_graph_entities', { search_terms: ['Tứ Diệu Đế', 'Khổ'] });
  if (e1) console.error('   ERROR:', e1.message);
  else console.log('   Found:', entities?.map((e: any) => `${e.entity_name} (${e.match_score?.toFixed(2)})`).join(', '));

  // Test 2: Full GraphRAG Search
  console.log(`\n🔍 Test 2: graphrag_search(['Tứ Diệu Đế', 'Bát Chánh Đạo'])`);
  const { data: ctx1, error: e2 } = await supabase
    .rpc('graphrag_search', { search_terms: ['Tứ Diệu Đế', 'Bát Chánh Đạo'] });
  if (e2) console.error('   ERROR:', e2.message);
  else console.log('   Context:\n' + (ctx1 || '(empty)').split('\n').map((l: string) => '   ' + l).join('\n'));

  // Test 3: Relational Query
  console.log(`\n🔍 Test 3: graphrag_search(['Vô Minh', 'Luân Hồi'])`);
  const { data: ctx2, error: e3 } = await supabase
    .rpc('graphrag_search', { search_terms: ['Vô Minh', 'Luân Hồi'] });
  if (e3) console.error('   ERROR:', e3.message);
  else console.log('   Context:\n' + (ctx2 || '(empty)').split('\n').map((l: string) => '   ' + l).join('\n'));

  // Test 4: Antidote query  
  console.log(`\n🔍 Test 4: graphrag_search(['Sân Hận', 'Từ'])`);
  const { data: ctx3, error: e4 } = await supabase
    .rpc('graphrag_search', { search_terms: ['Sân Hận', 'Từ'] });
  if (e4) console.error('   ERROR:', e4.message);
  else console.log('   Context:\n' + (ctx3 || '(empty)').split('\n').map((l: string) => '   ' + l).join('\n'));

  // Test 5: Slang/daily term
  console.log(`\n🔍 Test 5: graphrag_search(['Stress', 'Lo âu'])`);
  const { data: ctx4, error: e5 } = await supabase
    .rpc('graphrag_search', { search_terms: ['Stress', 'Lo âu'] });
  if (e5) console.error('   ERROR:', e5.message);
  else console.log('   Context:\n' + (ctx4 || '(empty)').split('\n').map((l: string) => '   ' + l).join('\n'));
}

verify().catch(console.error);
