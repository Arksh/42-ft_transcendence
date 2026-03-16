export const TERRITORIES = {
  // --- NORTE (Arriba) ---
  scotland: { name: "Escocia", capital: "Glasgow", colorKey: "#cccc33", cx: 210, cy: 110, neighbors: ["england", "norway"] },
  ireland: { name: "Irlanda", capital: "Dublín", colorKey: "#05ff23", cx: 160, cy: 170, neighbors: ["england", "scotland"] },
  england: { name: "Inglaterra", capital: "Londres", colorKey: "#ff4005", cx: 240, cy: 195, neighbors: ["scotland", "ireland", "france", "hanover", "batavia", "portugal"] },
  norway: { name: "Noruega", capital: "Oslo", colorKey: "#ff9905", cx: 380, cy: 80, neighbors: ["sweden", "denmark", "scotland"] },
  sweden: { name: "Suecia", capital: "Estocolmo", colorKey: "#4a66f7", cx: 440, cy: 90, neighbors: ["norway", "denmark", "east_prussia"] },
  denmark: { name: "Dinamarca", capital: "Copenhague", colorKey: "#4a66f7", cx: 390, cy: 165, neighbors: ["sweden", "norway", "hanover"] },

  // --- OESTE (Francia e Iberia) ---
  france: { name: "Francia", capital: "París", colorKey: "#010ce1", cx: 315, cy: 290, neighbors: ["england", "belgium", "rhine_west", "helvetia", "piemonte", "catalonia"] },
  catalonia: { name: "Cataluña", capital: "Barcelona", colorKey: "#f4a398", cx: 300, cy: 385, neighbors: ["france", "spain"] },
  spain: { name: "España", capital: "Madrid", colorKey: "#2841fe", cx: 190, cy: 430, neighbors: ["catalonia", "portugal", "barbary"] },
  portugal: { name: "Portugal", capital: "Lisboa", colorKey: "#64fa00", cx: 125, cy: 440, neighbors: ["spain", "england"] },

  // --- CENTRO (Alemania y Benelux) ---
  batavia: { name: "P. Bajos", capital: "Ámsterdam", colorKey: "#5bf9a5", cx: 335, cy: 210, neighbors: ["belgium", "hanover", "england"] },
  belgium: { name: "Bélgica", capital: "Waterloo", colorKey: "#5bf9a5", cx: 325, cy: 240, neighbors: ["france", "batavia", "rhine_west"] },
  hanover: { name: "Hannover", capital: "Hannover", colorKey: "#eec400", cx: 395, cy: 205, neighbors: ["batavia", "denmark", "brandenburg", "saxony", "rhine_west"] },
  rhine_west: { name: "Renania", capital: "Colonia", colorKey: "#9f4dfb", cx: 365, cy: 255, neighbors: ["france", "belgium", "hanover", "saxony", "bavaria"] },
  saxony: { name: "Sajonia", capital: "Dresde", colorKey: "#f5e2d1", cx: 425, cy: 240, neighbors: ["rhine_west", "hanover", "brandenburg", "bohemia", "bavaria"] },
  bavaria: { name: "Baviera y Wurt.", capital: "Múnich", colorKey: "#98e8f4", cx: 410, cy: 295, neighbors: ["rhine_west", "saxony", "austria", "helvetia"] },
  helvetia: { name: "Suiza", capital: "Ginebra", colorKey: "#01e1d4", cx: 355, cy: 320, neighbors: ["france", "bavaria", "piemonte"] },

  // --- ESTE (Prusia, Austria, Rusia) ---
  brandenburg: { name: "Prusia", capital: "Berlín", colorKey: "#c6f4c6", cx: 460, cy: 215, neighbors: ["hanover", "saxony", "bohemia", "east_prussia", "poland"] },
  east_prussia: { name: "Prusia Oriental", capital: "Königsberg", colorKey: "#b23904", cx: 525, cy: 180, neighbors: ["brandenburg", "poland", "baltic_states"] },
  bohemia: { name: "Bohemia", capital: "Praga", colorKey: "#dcfb4d", cx: 445, cy: 260, neighbors: ["saxony", "brandenburg", "austria", "poland"] },
  austria: { name: "Austria", capital: "Viena", colorKey: "#e000fa", cx: 475, cy: 305, neighbors: ["bavaria", "bohemia", "hungary", "venetia"] },
  poland: { name: "Polonia", capital: "Varsovia", colorKey: "#4a66f7", cx: 535, cy: 230, neighbors: ["brandenburg", "east_prussia", "galicia", "belarus", "bohemia"] },
  galicia: { name: "Galitzia", capital: "Lemberg", colorKey: "#994133", cx: 570, cy: 275, neighbors: ["poland", "hungary", "ukraine"] },
  hungary: { name: "Hungría", capital: "Budapest", colorKey: "#949439", cx: 530, cy: 330, neighbors: ["austria", "galicia", "serbia", "wallachia"] },

  // --- IMPERIO RUSO (Lejano Este) ---
  baltic_states: { name: "Báltico", capital: "Riga", colorKey: "#339910", cx: 555, cy: 155, neighbors: ["east_prussia", "belarus"] },
  belarus: { name: "Bielorrusia", capital: "Smolensk", colorKey: "#339910", cx: 620, cy: 200, neighbors: ["poland", "baltic_states", "moscow", "ukraine"] },
  moscow: { name: "Moscú", capital: "Moscú", colorKey: "#6bce10", cx: 720, cy: 160, neighbors:  ["belarus", "ukraine"] },
  ukraine: { name: "Ucrania", capital: "Kiev", colorKey: "#cee763", cx: 650, cy: 290, neighbors: ["belarus", "moscow", "galicia", "moldavia"] },

  // --- SUR (Italia y Balcanes) ---
  piemonte: { name: "Piamonte", capital: "Turín", colorKey: "#068598", cx: 375, cy: 355, neighbors: ["france", "helvetia", "lombardia", "papal_states"] },
  lombardia: { name: "Lombardía", capital: "Milán", colorKey: "#cefa00", cx: 405, cy: 350, neighbors: ["piemonte", "venetia", "papal_states"] },
  venetia: { name: "Venecia", capital: "Venecia", colorKey: "#b24104", cx: 435, cy: 345, neighbors: ["piemonte", "austria", "dalmatia", "lombardia"] },
  papal_states: { name: "Est. Papales", capital: "Roma", colorKey: "#fece28", cx: 425, cy: 410, neighbors: ["piemonte", "lombardia", "venetia", "naples"] },
  naples: { name: "Nápoles", capital: "Nápoles", colorKey: "#1ad701", cx: 460, cy: 450, neighbors: ["papal_states", "tunisia"] },
  dalmatia: { name: "Prov. Ilirias", capital: "Zara", colorKey: "#35fd43", cx: 470, cy: 385, neighbors: ["venetia", "serbia", "austria", "hungary"] },
  serbia: { name: "Serbia", capital: "Belgrado", colorKey: "#ff9400", cx: 510, cy: 380, neighbors: ["hungary", "bulgaria", "greece", "bosnia"] },
  wallachia: { name: "Valaquia", capital: "Bucarest", colorKey: "#7be7e7", cx: 590, cy: 350, neighbors: ["hungary", "ukraine", "bulgaria"] },
  bulgaria: { name: "Bulgaria", capital: "Sofía", colorKey: "#ceade7", cx: 600, cy: 400, neighbors: ["serbia", "wallachia", "constantinople"] },
  greece: { name: "Grecia", capital: "Atenas", colorKey: "#33e7e7", cx: 560, cy: 480, neighbors: ["bulgaria", "serbia", "levant", "constantinople"] },

  // --- MEDITERRÁNEO Y ÁFRICA (Fondo) ---
  barbary: { name: "Barbary", capital: "Argel", colorKey: "#11ffb9", cx: 280, cy: 530, neighbors: ["spain", "tunisia"] },
  tunisia: { name: "Túnez", capital: "Túnez", colorKey: "#b98df5", cx: 380, cy: 540, neighbors: ["barbary", "naples", "cyrenaica"] },
  cyrenaica: { name: "Cirenaica", capital: "Bengasi", colorKey: "#b98df5", cx: 500, cy: 560, neighbors: ["tunisia", "egypt"] },
  egypt: { name: "Egipto", capital: "El Cairo", colorKey: "#b98df5", cx: 650, cy: 570, neighbors: ["cyrenaica", "levant"] },
  constantinople: { name: "Constantinopla", capital: "Estambul", colorKey: "#fd35c2", cx: 680, cy: 420, neighbors: ["bulgaria", "levant", "greece"] },
  levant: { name: "Levante", capital: "Jerusalén", colorKey: "#fd35c2", cx: 730, cy: 510, neighbors: ["constantinople", "egypt"] },
};
