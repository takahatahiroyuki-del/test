const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── データ読み書き ──────────────────────────────────────────
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return getInitialData();
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getInitialData() {
  return {
    members: ['田中', '鈴木', '佐藤', '山田', '中村'],
    projects: [
      {
        id: 1, name: '渋谷新店（A棟2F）', phase: '発注（工事）', status: 'doing', budget: 45000000,
        tasks: [
          { id: 1, name: '内装業者への発注書作成', cat: '発注', done: false, assignee: '田中', due: '2026-06-10', priority: 'high' },
          { id: 2, name: '賃貸借契約書の確認', cat: '契約', done: true,  assignee: '鈴木', due: '2026-05-30', priority: 'mid' },
          { id: 3, name: '設計会社との協議（2回目）', cat: '協議', done: false, assignee: '佐藤', due: '2026-06-15', priority: 'mid' },
          { id: 4, name: '稟議書の提出', cat: '稟議', done: false, assignee: '山田', due: '2026-06-08', priority: 'high' }
        ],
        funds: [
          { id: 1, name: '工事費', budgeted: 20000000, actual: 18500000, status: '承認済' },
          { id: 2, name: '設計費', budgeted: 3000000,  actual: 3200000,  status: '超過' },
          { id: 3, name: '什器費', budgeted: 8000000,  actual: 0,        status: '未申請' }
        ]
      },
      {
        id: 2, name: '新宿店リニューアル', phase: '協議中', status: 'todo', budget: 22000000,
        tasks: [
          { id: 5, name: 'オーナーとの賃料交渉', cat: '協議', done: false, assignee: '田中', due: '2026-06-20', priority: 'high' },
          { id: 6, name: '現地調査レポート作成', cat: '会議', done: true,  assignee: '中村', due: '2026-06-05', priority: 'low' },
          { id: 7, name: '改装プラン発注', cat: '発注', done: false, assignee: '鈴木', due: '2026-07-01', priority: 'mid' }
        ],
        funds: [
          { id: 1, name: '設計費',    budgeted: 2000000,  actual: 0, status: '未申請' },
          { id: 2, name: '内装工事費', budgeted: 15000000, actual: 0, status: '未申請' }
        ]
      },
      {
        id: 3, name: '品川店（移転）', phase: '契約締結', status: 'doing', budget: 31000000,
        tasks: [
          { id: 8,  name: '移転先賃貸契約の締結',     cat: '契約', done: true,  assignee: '佐藤', due: '2026-05-28', priority: 'high' },
          { id: 9,  name: '旧店舗原状回復工事発注',   cat: '発注', done: false, assignee: '山田', due: '2026-06-25', priority: 'mid' },
          { id: 10, name: '行政との協議（用途変更）', cat: '協議', done: false, assignee: '田中', due: '2026-07-10', priority: 'mid' },
          { id: 11, name: '稟議書承認取得',           cat: '稟議', done: true,  assignee: '中村', due: '2026-05-20', priority: 'high' }
        ],
        funds: [
          { id: 1, name: '保証金',     budgeted: 6000000,  actual: 6000000, status: '承認済' },
          { id: 2, name: '原状回復費', budgeted: 5000000,  actual: 0,       status: '申請中' },
          { id: 3, name: '新店内装費', budgeted: 18000000, actual: 0,       status: '未申請' }
        ]
      }
    ]
  };
}

// 初回起動時にファイルがなければ初期データを書き込む
if (!fs.existsSync(DATA_FILE)) {
  writeData(getInitialData());
}

// ── API ────────────────────────────────────────────────────

// 全データ取得
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// 全データ保存（フロントから状態をそのまま送る）
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    if (!data || !Array.isArray(data.projects) || !Array.isArray(data.members)) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    writeData(data);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Save failed' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ 店舗開発タスク管理サーバー起動`);
  console.log(`   → http://localhost:${PORT}\n`);
});
