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
    { type: 'video', src: '/media/Snapchat-1498619424.mp4', title: 'The Day We Met', caption: 'I did not know yet, but everything changed.' },
    { type: 'video', src: '/media/Snapchat-439730762.mp4', title: 'The Ice Cream Treaty', caption: 'Terms: you pick the flavor, I pay.' },
    { type: 'video', src: '/media/Snapchat-620829369.mp4', title: 'Memory Three', caption: 'luvv u pravaluu' },
    { type: 'video', src: '/media/Snapchat-800588640.mp4', title: 'Memory Four', caption: 'A moment worth replaying.' },
    { type: 'video', src: '/media/Snapchat-922642426.mp4', title: 'Memory Five', caption: 'i will love u until your marriage' },
    { type: 'video', src: '/media/Snapchat-981777428.mp4', title: 'Memory Six', caption: 'thank you for coming into my life' },
    { type: 'video', src: '/media/video_20260414_091234.mp4', title: 'Memory Seven', caption: 'i hoped that u will stay forever in my life' },
    { type: 'video', src: '/media/video_20260823_224733.mp4', title: 'Memory Eight', caption: 'but its impossible' },
  ],
}
