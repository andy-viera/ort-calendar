// Paste this in Chrome DevTools Console while on the EVENTOS MARZO 2026 page
// (https://aulas.ort.edu.uy/mod/folder/view.php?id=554848)
// It downloads one PDF at a time with 3-second delays

(async () => {
  const pdfs = [
    {name: 'sistemas_sem1.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%201%20%2814%29.pdf'},
    {name: 'sistemas_sem2.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%202%20%2811%29.pdf'},
    {name: 'sistemas_sem3.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%203%20%288%29.pdf'},
    {name: 'sistemas_sem4.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%204%20%286%29.pdf'},
    {name: 'sistemas_sem5.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%205%20%288%29.pdf'},
    {name: 'sistemas_sem6.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%206%20%285%29.pdf'},
    {name: 'sistemas_sem7.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%207%20%286%29.pdf'},
    {name: 'sistemas_sem8.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%208%20%2811%29.pdf'},
    {name: 'sistemas_sem9.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%209%20%287%29.pdf'},
    {name: 'sistemas_electivas.pdf', url: 'https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/EVENTOS%20ELECTIVAS%20%284%29.pdf'},
  ];

  for (const pdf of pdfs) {
    console.log(`Downloading ${pdf.name}...`);
    const resp = await fetch(pdf.url);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdf.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`  Done: ${pdf.name} (${blob.size} bytes)`);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('All downloads complete!');
})();
