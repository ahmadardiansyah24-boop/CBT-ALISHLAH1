import React, { useState } from 'react';
import { useCBT } from '../../context/CBTContext';
import { Question, QuestionType, DifficultyLevel } from '../../types/cbt';
import { FormulaRenderer } from '../common/FormulaRenderer';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  CheckCircle,
  Sparkles,
  HelpCircle,
  Eye,
  Image,
  Volume2,
  X,
  Code,
  FileJson,
} from 'lucide-react';

export const ProctorQuestionBank: React.FC = () => {
  const {
    questions,
    currentExam,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestions,
  } = useCBT();

  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form State
  const [subject, setSubject] = useState('Matematika Peminatan');
  const [type, setType] = useState<QuestionType>('single_choice');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [weight, setWeight] = useState(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('sedang');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioCaption, setAudioCaption] = useState('');
  const [explanation, setExplanation] = useState('');

  // Options State for single_choice
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: true },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
    { id: 'E', text: '', isCorrect: false },
  ]);
  const [correctKey, setCorrectKey] = useState('B');
  const [shortAnswerKey, setShortAnswerKey] = useState('');

  const subjects = Array.from(new Set(questions.map((q) => q.subject)));

  const filteredQuestions = questions.filter((q) => {
    if (activeSubject !== 'all' && q.subject !== activeSubject) return false;
    return true;
  });

  const handleOpenNew = () => {
    setEditingQuestionId(null);
    setSubject(currentExam?.subject || 'Matematika Peminatan');
    setType('single_choice');
    setTopic('');
    setPrompt('Hitunglah nilai dari $x$ pada persamaan berikut:\n$$2x + 10 = 24$$');
    setWeight(10);
    setDifficulty('sedang');
    setImageUrl('');
    setImageCaption('');
    setAudioUrl('');
    setAudioCaption('');
    setExplanation('Pindahkan $10$ ke ruas kanan: $2x = 14 \\implies x = 7$.');
    setOptions([
      { id: 'A', text: '$$5$$', isCorrect: false },
      { id: 'B', text: '$$7$$', isCorrect: true },
      { id: 'C', text: '$$12$$', isCorrect: false },
      { id: 'D', text: '$$14$$', isCorrect: false },
      { id: 'E', text: '$$2$$', isCorrect: false },
    ]);
    setCorrectKey('B');
    setShortAnswerKey('');
    setIsEditorOpen(true);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setSubject(q.subject);
    setType(q.type);
    setTopic(q.topic || '');
    setPrompt(q.prompt);
    setWeight(q.weight);
    setDifficulty(q.difficulty);
    setImageUrl(q.image || '');
    setImageCaption(q.imageCaption || '');
    setAudioUrl(q.audio || '');
    setAudioCaption(q.audioCaption || '');
    setExplanation(q.explanation || '');
    if (q.options) {
      setOptions(q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: Boolean(o.isCorrect) })));
    }
    if (q.answerKey) {
      if (typeof q.answerKey === 'string') {
        setCorrectKey(q.answerKey);
        setShortAnswerKey(q.answerKey);
      }
    }
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Teks pertanyaan tidak boleh kosong!');
      return;
    }

    const questionData: Question = {
      id: editingQuestionId || `q-custom-${Date.now()}`,
      examId: currentExam?.id || 'exam-mtk-xii',
      subject,
      type,
      topic,
      prompt,
      weight: Number(weight),
      difficulty,
      image: imageUrl.trim() ? imageUrl.trim() : undefined,
      imageCaption: imageCaption.trim() ? imageCaption.trim() : undefined,
      audio: audioUrl.trim() ? audioUrl.trim() : undefined,
      audioCaption: audioCaption.trim() ? audioCaption.trim() : undefined,
      explanation: explanation.trim() ? explanation.trim() : undefined,
      options:
        type === 'single_choice' || type === 'multi_choice'
          ? options.map((opt) => ({
              ...opt,
              isCorrect: opt.id === correctKey,
            }))
          : undefined,
      answerKey: type === 'short_answer' ? shortAnswerKey : correctKey,
    };

    if (editingQuestionId) {
      updateQuestion(editingQuestionId, questionData);
    } else {
      createQuestion(questionData);
    }

    setIsEditorOpen(false);
  };

  const insertFormulaTemplate = (template: string) => {
    setPrompt((prev) => prev + template);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bank_soal_cbt_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          importQuestions(imported);
          alert(`Berhasil mengimpor ${imported.length} butir soal ke dalam Bank Soal!`);
        }
      } catch (err) {
        alert('Format file JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubject === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Mapel ({questions.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubject === sub
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sub} ({questions.filter((q) => q.subject === sub).length})
            </button>
          ))}
        </div>

        {/* Action Buttons: Add, Import, Export */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            Belum ada soal untuk mata pelajaran ini. Silakan tambahkan soal baru.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    No. {idx + 1}
                  </span>
                  <span className="font-bold text-slate-700">{q.subject}</span>
                  {q.topic && (
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {q.topic}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {q.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Bobot: {q.weight} Poin</span>
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Soal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus butir soal ini dari bank soal?')) {
                        deleteQuestion(q.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question prompt content */}
              <div className="text-xs sm:text-sm text-slate-900 border-l-2 border-blue-500 pl-3">
                <FormulaRenderer content={q.prompt} />
              </div>

              {/* Thumbnail image if exists */}
              {q.image && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <Image className="w-4 h-4 text-blue-600" />
                  <span>Gambar Lampiran: {q.imageCaption || q.image}</span>
                </div>
              )}

              {/* Options Preview */}
              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt) => {
                    const isKey = opt.id === q.answerKey || (Array.isArray(q.answerKey) && q.answerKey.includes(opt.id));
                    return (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-lg border flex items-center gap-2 ${
                          isKey
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${isKey ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {opt.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <FormulaRenderer content={opt.text} inline />
                        </div>
                        {isKey && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Question Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">
                {editingQuestionId ? 'Edit Butir Soal' : 'Tambah Soal Baru ke Bank Soal'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipe Soal
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as QuestionType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="single_choice">Pilihan Ganda (Single Choice)</option>
                    <option value="multi_choice">Pilihan Ganda Kompleks</option>
                    <option value="short_answer">Isian Singkat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Topik / Kompetensi
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Limit Trigonometri"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Quick Math Formula Insertion Helpers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Teks Pertanyaan (Mendukung Formula LaTeX & Markdown)
                  </label>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    Formula Helper:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 mb-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $\\frac{a}{b}$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Pecahan \frac
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $\\sqrt{x}$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Akar \sqrt
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $$\\lim_{x \\to 0} f(x)$$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Limit \lim
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $$\\int_a^b f(x) dx$$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Integral \int
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $x^2 + y_1$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Pangkat/Indeks
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormulaTemplate(' $\\Delta H, H_2SO_4$ ')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 rounded text-slate-800 font-mono text-[11px] border border-slate-300"
                  >
                    Kimia/Reaksi
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              {/* Real-time KaTeX Live Preview */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                  Pratinjau Tampilan Soal (Live Preview):
                </span>
                <div className="text-slate-900 text-xs sm:text-sm bg-white p-3 rounded-lg border border-blue-100">
                  <FormulaRenderer content={prompt || '(Ketikkan soal untuk melihat pratinjau formula)'} />
                </div>
              </div>

              {/* Image & Audio URL Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Gambar Lampiran (Opsional)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Keterangan Gambar
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Contoh: Grafik Fungsi Kuadrat"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Options for single choice */}
              {type === 'single_choice' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Pilihan Jawaban & Kunci:
                  </label>
                  {options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctKeyRadio"
                        checked={correctKey === opt.id}
                        onChange={() => setCorrectKey(opt.id)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Tandai sebagai Kunci Jawaban Benar"
                      />
                      <span className="w-6 font-bold text-slate-800 text-center font-mono">
                        {opt.id}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions((prev) =>
                            prev.map((o, idx) => (idx === i ? { ...o, text: val } : o))
                          );
                        }}
                        placeholder={`Teks pilihan ${opt.id}...`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  ))}
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    Kunci Jawaban yang Dipilih: Opsi <strong>{correctKey}</strong>
                  </div>
                </div>
              )}

              {/* Short Answer Key */}
              {type === 'short_answer' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kunci Jawaban Isian Singkat
                  </label>
                  <input
                    type="text"
                    value={shortAnswerKey}
                    onChange={(e) => setShortAnswerKey(e.target.value)}
                    placeholder="Contoh: 19 atau fotosintesis"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              {/* Weight & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tingkat Kesukaran
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sukar">Sukar</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pembahasan Ilmiah & Solusi
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Penjelasan langkah penyelesaian..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition-all cursor-pointer"
                >
                  Simpan Soal ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
