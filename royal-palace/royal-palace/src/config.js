// ✏️ EDIT EVERYTHING HERE. Put files in /public/media/ and reference them as "/media/<file>".
const her = 'Aisha'      // <- HER NAME
const me = 'Rahul'       // <- YOUR NAME

export default {
  herName: her,
  myName: me,
  loadingLabel: `THE ${her.toUpperCase()} REGENCY`,
  ballroomSignText: 'A little kingdom, made for one very special girl.',
  music: '/media/song.mp3',
  finalLines: ['Every rose here is yours.', `Happy Princess Day, ${her}. - ${me}`],
  loveLetter: `My dearest ${her},

Write your love letter here. Use blank lines for new paragraphs.

Forever yours,
${me}`,
  // type: "photo" | "video"
  memories: [
    { type: 'photo', src: '/media/memory1.jpg', title: 'The Day We Met', caption: 'I did not know yet, but everything changed.' },
    { type: 'photo', src: '/media/memory2.jpg', title: 'The Ice Cream Treaty', caption: 'Terms: you pick the flavor, I pay.' },
    { type: 'photo', src: '/media/memory3.jpg', title: 'Memory Three', caption: 'Write a short caption.' },
    { type: 'video', src: '/media/memory4.mp4', title: 'Memory Four', caption: 'A moment worth replaying.' },
    { type: 'photo', src: '/media/memory5.jpg', title: 'Memory Five', caption: 'Write a short caption.' },
    { type: 'photo', src: '/media/memory6.jpg', title: 'Memory Six', caption: 'Write a short caption.' },
    { type: 'photo', src: '/media/memory7.jpg', title: 'Memory Seven', caption: 'Write a short caption.' },
    { type: 'photo', src: '/media/memory8.jpg', title: 'Memory Eight', caption: 'Write a short caption.' },
  ],
}
