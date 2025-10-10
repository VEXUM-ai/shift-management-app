/**
 * クライアント先（常駐先）一括登録スクリプト
 *
 * 使い方:
 * 1. Netlifyサイトを開く
 * 2. ブラウザのデベロッパーツール（F12）を開く
 * 3. Consoleタブを選択
 * 4. このスクリプト全体をコピー＆ペーストして実行
 */

// クライアント先データ
const locationsData = [
  {
    name: 'シェアウィズ',
    description: 'HPやオンライン受験などのWebサービスをその会社のために設計・運営している会社',
    project: 'プロダクト：自動ソート化、CS：ナレッジ化・AIチャットBot',
    hourlyRate: 0, // 時給は後で設定
    travelAllowance: 0, // 交通費は後で設定
  },
  {
    name: '旭',
    description: '訪問介護。既存のDXツールの代替品をより安価にAIを活用して使いやすくする',
    project: 'Kintoneによる移行可能性の提案書作成中',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'きずな',
    description: '不動産管理会社。大家からの物件の工事などの代行をしている',
    project: '工事内容の請求書作成を自動化。PDFから請求書を手動作成していた部分の自動化。金銭間の移動の可視化',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'Onegroup',
    description: '介護福祉就労支援の会社。個人個人に対して適した仕事に就くための支援',
    project: '個別支援計画の自動化、請求書業務の自動化',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'シースカイ',
    description: '総合商社。社長の岡さんの支援活動',
    project: '商材に対する営業資料の作成。商材発表に向けての計画書作成',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'アクロライツ',
    description: 'ホストクラブ。売上向上のためにAIを活用。SNSの管理などにも活用',
    project: '施策案の作成、Q&Aの作成中',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'エイトキューブ',
    description: 'イベント・プロモーションを運営している会社',
    project: '各業務に対するAI活用による自動化',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: '東幸海運',
    description: 'タンカーを運営している会社。6隻運営している。船舶における管理部門のAI化',
    project: '各船舶に対する部品やマニュアルの電子化、ナレッジ化。各部品における交渉などの属人化タスクのAI化',
    hourlyRate: 0,
    travelAllowance: 0,
  },
  {
    name: 'ダイキョウクリーン',
    description: '', // 情報未提供
    project: '', // 情報未提供
    hourlyRate: 0,
    travelAllowance: 0,
  },
]

// 既存のクライアント先を取得
const existingLocations = JSON.parse(localStorage.getItem('shift_app_locations') || '[]')
console.log(`既存のクライアント先数: ${existingLocations.length}`)

// 新しいIDを生成（既存の最大ID + 1から開始）
let nextId = existingLocations.length > 0
  ? Math.max(...existingLocations.map(l => l.id)) + 1
  : 1

// 新規クライアント先のみを追加
const newLocations = []
const skippedLocations = []

locationsData.forEach(data => {
  // 名前で重複チェック
  const exists = existingLocations.find(l => l.name === data.name)

  if (exists) {
    skippedLocations.push(data.name)
    console.log(`⏭️  スキップ: ${data.name} - 既に登録済み`)
  } else {
    const location = {
      id: nextId++,
      name: data.name,
      description: data.description,
      project: data.project,
      hourly_rate: data.hourlyRate,
      travel_allowance: data.travelAllowance,
      created_at: new Date().toISOString(),
    }
    newLocations.push(location)
    console.log(`✅ 追加: ${data.name}`)
  }
})

// 既存のクライアント先と新規クライアント先をマージ
const allLocations = [...existingLocations, ...newLocations]

// LocalStorageに保存
localStorage.setItem('shift_app_locations', JSON.stringify(allLocations))

// 結果を表示
console.log('\n========== 登録結果 ==========')
console.log(`✅ 新規登録: ${newLocations.length}件`)
console.log(`⏭️  スキップ: ${skippedLocations.length}件`)
console.log(`📊 合計クライアント先数: ${allLocations.length}件`)
console.log('==============================\n')

if (skippedLocations.length > 0) {
  console.log('スキップされたクライアント先:')
  skippedLocations.forEach(name => console.log(`  - ${name}`))
}

console.log('\n📋 登録されたクライアント先:')
newLocations.forEach(loc => {
  console.log(`  - ${loc.name}`)
  if (loc.description) console.log(`    説明: ${loc.description}`)
  if (loc.project) console.log(`    案件: ${loc.project}`)
})

console.log('\n⚠️  注意: 時給と交通費は後で設定してください')
console.log('✨ 登録完了！ページをリロードしてください。')

// 自動でページリロード（コメントアウト）
// setTimeout(() => window.location.reload(), 2000)
