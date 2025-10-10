/**
 * メンバー一括登録スクリプト
 *
 * 使い方:
 * 1. Netlifyサイトを開く
 * 2. ブラウザのデベロッパーツール（F12）を開く
 * 3. Consoleタブを選択
 * 4. このスクリプト全体をコピー＆ペーストして実行
 */

// メンバーデータ
const membersData = [
  { name: '青木 こる', email: 'k.aoki@vexum-ai.com', salaryType: 'fixed', hourlyWage: 0, fixedSalary: 500000, isAdmin: true },
  { name: '水谷 明慎', email: 'a.mizugai@vexum-ai.com', salaryType: 'fixed', hourlyWage: 0, fixedSalary: 200000, isAdmin: false },
  { name: '佃 柊志', email: 't.tsukuda@vexum-ai.com', salaryType: 'fixed', hourlyWage: 0, fixedSalary: 300000, isAdmin: false },
  { name: '後藤 悠太', email: 'y.goto@vexum-ai.com', salaryType: 'fixed', hourlyWage: 0, fixedSalary: 200000, isAdmin: false },
  { name: '庄田 桂梧', email: 'k.shoda@vexum-ai.com', salaryType: 'fixed', hourlyWage: 0, fixedSalary: 200000, isAdmin: false },
  { name: '喜田 一成', email: 'i.kita@vexum-ai.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '嶋谷 侑飛', email: 'youfeidaogu@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '仲川 怜毅', email: 'n.reiki211@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '神田 はるか', email: 'k686500@kansai-u.ac.jp', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: 'ユヒョン', email: 'taljeon0928@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '尾山 太一', email: 'taichi1492@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '小川 遥生', email: 'haruki.ogawa.ku@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '中村 遥斗', email: 'nak.haruto@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '岡田 拓士', email: 'takuto.okada920@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '稲田 陽向', email: 'yangxiangdaotian20@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '阿部 大和', email: 'abud05855@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '前田 侑香', email: 'maeda.yuka.44n@st.kyoto-u.ac.jp', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '向山 颯太', email: 'souta.m0919@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '道浦 空', email: 's.michiura@vexum-ai.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '皆川 陽都', email: 'sharingwife0710@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '西峯 拓都', email: 'tkt.nsmn@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '吉田 壮汰', email: 'sota.yo4da@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '西山 大智', email: '0113daichi0113@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '小野 広登', email: 'onohrt.27@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '片木 裕司', email: 'ktg27wpolo@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '本坊 秀明', email: 'benfangxiuming@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '林巴朗', email: 'tomorou0216@au.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '北田航太郎', email: 'kitada.k0611@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '松本果大', email: 'songbenguoda@gmail.com', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
  { name: '廣岡稜生', email: 'k658416@kansai-u.ac.jp', salaryType: 'hourly', hourlyWage: 1500, fixedSalary: 0, isAdmin: false },
]

// 既存のメンバーを取得
const existingMembers = JSON.parse(localStorage.getItem('shift_app_members') || '[]')
console.log(`既存のメンバー数: ${existingMembers.length}`)

// 新しいIDを生成（既存の最大ID + 1から開始）
let nextId = existingMembers.length > 0
  ? Math.max(...existingMembers.map(m => m.id)) + 1
  : 1

// 新規メンバーのみを追加
const newMembers = []
const skippedMembers = []

membersData.forEach(data => {
  // 名前とメールアドレスで重複チェック
  const existsByEmail = existingMembers.find(m => m.email === data.email)
  const existsByName = existingMembers.find(m => m.name === data.name)

  if (existsByEmail) {
    skippedMembers.push(data.name)
    console.log(`⏭️  スキップ: ${data.name} (${data.email}) - メールアドレスが既に登録済み`)
  } else if (existsByName) {
    skippedMembers.push(data.name)
    console.log(`⏭️  スキップ: ${data.name} - 同じ名前が既に登録済み（重複登録を防止）`)
  } else {
    const member = {
      id: nextId++,
      name: data.name,
      email: data.email,
      office_transport_fee: 0, // デフォルト0円
      salary_type: data.salaryType,
      hourly_wage: data.hourlyWage,
      fixed_salary: data.fixedSalary,
      is_admin: data.isAdmin || false,
      is_advisor: data.isAdvisor || false,
      password: '', // パスワードは後で各ユーザーが設定
      created_at: new Date().toISOString(),
    }
    newMembers.push(member)
    console.log(`✅ 追加: ${data.name} (${data.email})`)
  }
})

// 既存のメンバーと新規メンバーをマージ
const allMembers = [...existingMembers, ...newMembers]

// LocalStorageに保存
localStorage.setItem('shift_app_members', JSON.stringify(allMembers))

// 結果を表示
console.log('\n========== 登録結果 ==========')
console.log(`✅ 新規登録: ${newMembers.length}名`)
console.log(`⏭️  スキップ: ${skippedMembers.length}名`)
console.log(`📊 合計メンバー数: ${allMembers.length}名`)
console.log('==============================\n')

if (skippedMembers.length > 0) {
  console.log('スキップされたメンバー:')
  skippedMembers.forEach(name => console.log(`  - ${name}`))
}

console.log('\n✨ 登録完了！ページをリロードしてください。')

// 自動でページリロード（コメントアウト）
// setTimeout(() => window.location.reload(), 2000)
