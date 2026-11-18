// ✏️ EDIT EVERYTHING HERE. Put files in /public/media/ and reference them as "/media/<file>".
const her = 'pravlika'      // <- HER NAME
const me = 'Dheeraj'       // <- YOUR NAME

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
    { type: 'video', src: '/media/memory1.jpg', title: 'The Day We Met', caption: 'I did not know yet, but everything changed.' },
    { type: 'video', src: '/media/memory2.jpg', title: 'The Ice Cream Treaty', caption: 'Terms: you pick the flavor, I pay.' },
    { type: 'video', src: '/media/memory3.jpg', title: 'Memory Three', caption: 'luvv u pravaluu' },
    { type: 'video', src: '/media/memory4.mp4', title: 'Memory Four', caption: 'A moment worth replaying.' },
    { type: 'video', src: '/media/memory5.jpg', title: 'Memory Five', caption: 'i will love u until your marriage' },
    { type: 'video', src: '/media/memory6.jpg', title: 'Memory Six', caption: 'thank you for coming into my life' },
    { type: 'video', src: '/media/memory7.jpg', title: 'Memory Seven', caption: 'i hoped that u will stay forever in my life' },
    { type: 'video', src: '/media/memory8.jpg', title: 'Memory Eight', caption: 'but its impossible' },
  ],
}
