import { useEffect, useState } from 'react';
import NotifModal from './NotifModal';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDiffViewer from 'react-diff-viewer-continued';

const botFiles = import.meta.glob('./data/*.json', { eager: true });
const bots = Object.values(botFiles).map(f => f.default);

export default function App() {
  const [selectedBot, setSelectedBot] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [changelog, setChangelog] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitDetails, setCommitDetails] = useState(null);
  const [viewingDiff, setViewingDiff] = useState(null);

  const fetchCommitDetail = async (sha) => {
    setCommitDetails(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${selectedBot.repo}/commits/${sha}`,
        { headers: { Authorization: `${import.meta.env.VITE_GITHUB_TOKEN}` } }
      );
      if (!res.ok) throw new Error('Gagal mengambil detail commit');
      setCommitDetails(await res.json());
    } catch (err) {
      console.error(err);
      setCommitDetails({ error: true });
    }
  };

  useEffect(() => {
    if (selectedBot?.repo) {
      fetch(`https://api.github.com/repos/${selectedBot.repo}/commits`, {
        headers: { Authorization: `${import.meta.env.VITE_GITHUB_TOKEN}` }
      })
        .then((res) => {
          if (res.status === 403) throw new Error('API Limit reached');
          return res.json();
        })
        .then((data) =>
          setChangelog(Array.isArray(data) ? data.slice(0, 5) : [])
        )
        .catch((err) => {
          console.error(err);
          setChangelog([
            {
              commit: {
                message: 'Gagal memuat log (API Limit)',
                author: { date: new Date() }
              }
            }
          ]);
        });
    }
  }, [selectedBot]);

  return (
    <div className="bg-[#0b1221] text-white min-h-screen font-sans selection:bg-aqua-pink overflow-x-hidden">
      <AnimatePresence>
        {viewingDiff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0b1221] overflow-y-auto p-4 md:p-10"
          >
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => setViewingDiff(null)}
                className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
              >
                ← Kembali ke Detail Bot
              </button>
              <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-800 bg-[#0d1117] flex justify-between items-center">
                  <h3 className="font-mono text-blue-400 text-sm md:text-base truncate">
                    {viewingDiff.filename}
                  </h3>
                  <div className="flex gap-3 text-[10px] font-bold">
                    <span className="text-green-500">
                      +{viewingDiff.additions}
                    </span>
                    <span className="text-red-500">
                      -{viewingDiff.deletions}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto text-xs md:text-sm">
                  <ReactDiffViewer
                    oldValue=""
                    newValue={viewingDiff.patch}
                    splitView={false}
                    useDarkTheme={true}
                    hideLineNumbers={false}
                    styles={{
                      variables: {
                        dark: {
                          diffViewerBackground: '#0d1117',
                          addedBackground: 'rgba(46, 160, 67, 0.15)',
                          addedColor: '#7ee787',
                          removedBackground: 'rgba(248, 81, 73, 0.15)',
                          removedColor: '#ff7b72',
                          wordAddedBackground: 'rgba(46, 160, 67, 0.4)',
                          wordRemovedBackground: 'rgba(248, 81, 73, 0.4)'
                        }
                      },
                      contentText: {
                        fontSize: '13px',
                        lineHeight: '20px',
                        fontFamily: 'Fira Code, monospace'
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedBot ? (
          <motion.section
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-7xl mx-auto px-4 py-12 md:py-20"
          >
            <div className="text-center mb-12">
              <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight"
              >
                Galeri Bot
              </motion.h1>
              <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">
                Pilih bot yang mau kamu lihat
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {bots.map((bot) => (
                <motion.div
                  key={bot.name}
                  whileHover={{
                    y: -8,
                    shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBot(bot)}
                  className="bg-[#111827] p-5 rounded-2xl border border-gray-800/50 cursor-pointer hover:border-sky-500 transition-all flex flex-col items-center text-center group"
                >
                  <div className="relative mb-4">
                    <img
                      src={bot.avatar}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#1f2937] border border-gray-700 group-hover:border-sky-500 transition-colors p-1 object-cover"
                      alt={bot.name}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-aqua-pink text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shadow-lg">
                      {bot.platform}
                    </div>
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-white group-hover:text-sky-500 transition-colors line-clamp-1">
                    {bot.name}
                  </h2>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {bot.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-800/50 w-full">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
                      Buka Profile
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <nav className="max-w-6xl mx-auto px-6 py-8">
              <button
                onClick={() => setSelectedBot(null)}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-all"
              >
                ← Kembali ke Galeri
              </button>
            </nav>

            <section className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-6xl font-black mb-4">
                  {selectedBot.name}
                </h1>
                <p className="text-2xl text-gray-400 mb-8">
                  {selectedBot.tagline}
                </p>
                <div className="flex gap-4 justify-center md:justify-start font-bold">
                  <a
                    href={selectedBot.invite_link}
                    className="bg-[#0062ff] hover:bg-blue-600 px-8 py-3 rounded-xl transition-all"
                  >
                    Tambahkan ke {selectedBot.platform}
                  </a>
                  <a
                    href="#fitur"
                    className="bg-[#2a3447] hover:bg-gray-700 px-8 py-3 rounded-xl transition-all"
                  >
                    Lihat Fitur
                  </a>
                </div>
              </div>
              <motion.img
                layoutId={`img-${selectedBot.name}`}
                src={selectedBot.avatar}
                className="w-72 h-72 md:w-96 md:h-96 drop-shadow-[0_0_60px_rgba(255,45,85,0.2)]"
              />
            </section>

            <section className="max-w-6xl mx-auto px-6 py-32 space-y-40">
              <h2
                id="fitur"
                className="text-center text-3xl font-bold text-aqua-pink"
              >
                Fitur Unggulan
              </h2>
              {selectedBot.features?.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${
                    i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                  } items-center gap-20`}
                >
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-6">{f.title}</h3>
                    <p className="text-xl text-gray-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <div className="flex-1 p-4 rounded-3xl">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="rounded-2xl w-full"
                    />
                  </div>
                </motion.div>
              ))}
            </section>

            <section className="bg-[#0d1117] py-24 border-t border-gray-900">
              <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                  <h2 className="text-2xl font-bold mb-10">
                    Tutorial & Panduan
                  </h2>
                  <div className="grid gap-6">
                    {selectedBot.additional_links?.map((link, i) => (
                      <motion.a
                        whileHover={{ y: -8, borderColor: '#ff2d55' }}
                        key={i}
                        href={link.url}
                        className="p-8 bg-[#161b22] rounded-2xl border border-gray-800 block group transition-all"
                      >
                        <h4 className="font-bold text-xl mb-2">
                          {link.label}
                        </h4>
                        <p className="text-gray-400">{link.desc}</p>
                        <span className="text-aqua-pink mt-6 inline-block font-medium">
                          Lihat Detail →
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-10 text-aqua-pink">
                    GitHub Update (Changelog)
                  </h2>
                  <div className="space-y-6">
                    {changelog.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedCommit(c.sha);
                          fetchCommitDetail(c.sha);
                        }}
                        className="flex gap-4 group cursor-pointer p-2 hover:bg-gray-800/50 rounded-lg transition-all"
                      >
                        <div className="w-1 bg-white group-hover:bg-sky-500 rounded-full group-hover:h-12 transition-all"></div>
                        <div className="flex-1">
                          <p className="text-gray-200 font-medium line-clamp-1 group-hover:text-sky-500">
                            {c.commit.message}
                          </p>
                          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest">
                            {new Date(
                              c.commit.author.date
                            ).toLocaleDateString()}
                          </p>
                          <AnimatePresence>
                            {selectedCommit === c.sha && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-4 bg-[#0d1117] rounded-xl border border-gray-700 overflow-hidden"
                              >
                                <div className="p-3 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center text-[10px]">
                                  <span className="text-gray-400 font-bold uppercase">
                                    {commitDetails?.error
                                      ? 'Error Loading'
                                      : `Files Changed (${
                                          commitDetails?.files?.length || 0
                                        })`}
                                  </span>
                                </div>
                                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                  {!commitDetails ? (
                                    <div className="p-4 text-center">
                                      <div className="animate-spin inline-block w-4 h-4 border-2 border-aqua-pink border-t-transparent rounded-full mb-2"></div>
                                      <p className="text-[10px] text-gray-500 italic">
                                        Menghubungi GitHub...
                                      </p>
                                    </div>
                                  ) : commitDetails.error ? (
                                    <div className="p-4 text-center text-[10px] text-red-400">
                                      Gagal memuat detail file. Coba lagi nanti
                                      (API Limit).
                                    </div>
                                  ) : (
                                    commitDetails.files?.map((file, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => setViewingDiff(file)}
                                        className="flex items-center justify-between text-[11px] p-2 hover:bg-blue-500/10 rounded cursor-pointer group/file"
                                      >
                                        <span className="text-blue-400 truncate max-w-[180px] md:max-w-none group-hover/file:text-white transition-colors">
                                          {file.filename}
                                        </span>
                                        <div className="flex gap-2 font-mono text-[9px]">
                                          <span className="text-green-500">
                                            +{file.additions}
                                          </span>
                                          <span className="text-red-500">
                                            -{file.deletions}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <footer className="text-center py-12 text-gray-600 border-t border-gray-900">
              © 2026 di buat dengan cinta admin.
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Notification Button */}
      <button
        onClick={() => setNotifOpen(true)}
        className="fixed bottom-6 right-6 z-150 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none"
        aria-label="Notifikasi"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c1.104 0 2-.896 2-2H10c0 1.104.896 2 2 2zm6-6V11c0-3.07-1.64-5.64-5-6.32V4a1 1 0 10-2 0v.68C7.64 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 006 19h12a1 1 0 00.71-1.71L18 16z" />
        </svg>
      </button>
      <NotifModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}