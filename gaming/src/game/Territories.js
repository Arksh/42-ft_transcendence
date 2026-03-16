export const TERRITORIES = {
  // --- NORTE (Arriba) ---
  scotland: { name: "Escocia", capital: "Glasgow", colorKey: "#cccc33", cx: 230, cy: 50, neighbors: ["england", "norway"] },
  ireland: { name: "Irlanda", capital: "Dublín", colorKey: "#05ff23", cx: 160, cy: 100, neighbors: ["england", "scotland"] },
  england: { name: "Inglaterra", capital: "Londres", colorKey: "#ff4005", cx: 240, cy: 160, neighbors: ["scotland", "ireland", "france", "hanover", "batavia", "portugal"] },
  norway: { name: "Noruega", capital: "Oslo", colorKey: "#ff9905", cx: 380, cy: 20, neighbors: ["sweden", "denmark", "scotland"] },
  sweden: { name: "Suecia", capital: "Estocolmo", colorKey: "#4a66f7", cx: 470, cy: 30, neighbors: ["norway", "denmark", "east_prussia"] },
  denmark: { name: "Dinamarca", capital: "Copenhague", colorKey: "#ff5d05", cx: 390, cy: 110, neighbors: ["sweden", "norway", "hanover"] },

  // --- OESTE (Francia e Iberia) ---
  france: { name: "Francia", capital: "París", colorKey: "#010ce1", cx: 250, cy: 220, neighbors: ["england", "belgium", "rhine_west", "helvetia", "piemonte", "catalonia"] },
  catalonia: { name: "Cataluña", capital: "Barcelona", colorKey: "#f4a398", cx: 230, cy: 355, neighbors: ["france", "spain"] },
  spain: { name: "España", capital: "Madrid", colorKey: "#2841fe", cx: 130, cy: 365, neighbors: ["catalonia", "portugal", "barbary"] },
  portugal: { name: "Portugal", capital: "Lisboa", colorKey: "#64fa00", cx: 40, cy: 365, neighbors: ["spain", "england"] },

  // --- CENTRO (Alemania y Benelux) ---
  batavia: { name: "P. Bajos", capital: "Ámsterdam", colorKey: "#5bf9a5", cx: 310, cy: 150, neighbors: ["belgium", "hanover", "england"] },
  belgium: { name: "Bélgica", capital: "Waterloo", colorKey: "#ef6394", cx: 305, cy: 185, neighbors: ["france", "batavia", "rhine_west"] },
  hanover: { name: "Hannover", capital: "Hannover", colorKey: "#eec400", cx: 370, cy: 160, neighbors: ["batavia", "denmark", "brandenburg", "saxony", "rhine_west"] },
  rhine_west: { name: "Renania", capital: "Colonia", colorKey: "#9f4dfb", cx: 345, cy: 190, neighbors: ["france", "belgium", "hanover", "saxony", "bavaria"] },
  saxony: { name: "Sajonia", capital: "Dresde", colorKey: "#f5e2d1", cx: 400, cy: 180, neighbors: ["rhine_west", "hanover", "brandenburg", "bohemia", "bavaria"] },
  bavaria: { name: "Baviera", capital: "Múnich", colorKey: "#98e8f4", cx: 380, cy: 230, neighbors: ["rhine_west", "saxony", "austria", "helvetia"] },
  helvetia: { name: "Suiza", capital: "Ginebra", colorKey: "#01e1d4", cx: 330, cy: 265, neighbors: ["france", "bavaria", "piemonte"] },

  // --- ESTE (Prusia, Austria, Rusia) ---
  brandenburg: { name: "Prusia", capital: "Berlín", colorKey: "#c6f4c6", cx: 420, cy: 150, neighbors: ["hanover", "saxony", "bohemia", "east_prussia", "poland"] },
  east_prussia: { name: "Prusia Oriental", capital: "Königsberg", colorKey: "#b23904", cx: 490, cy: 120, neighbors: ["brandenburg", "poland", "baltic_states"] },
  bohemia: { name: "Bohemia", capital: "Praga", colorKey: "#dcfb4d", cx: 440, cy: 200, neighbors: ["saxony", "brandenburg", "austria", "poland"] },
  austria: { name: "Austria", capital: "Viena", colorKey: "#e000fa", cx: 435, cy: 245, neighbors: ["bavaria", "bohemia", "hungary", "venetia"] },
  poland: { name: "Polonia", capital: "Varsovia", colorKey: "#05a599", cx: 495, cy: 195, neighbors: ["brandenburg", "east_prussia", "galicia", "belarus", "bohemia"] },
  galicia: { name: "Galitzia", capital: "Lemberg", colorKey: "#994133", cx: 550, cy: 210, neighbors: ["poland", "hungary", "ukraine"] },
  hungary: { name: "Hungría", capital: "Budapest", colorKey: "#949439", cx: 500, cy: 250, neighbors: ["austria", "galicia", "serbia", "wallachia"] },
  dalmatia: { name: "Prov. Ilirias", capital: "Liubliana", colorKey: "#35fd43", cx: 430, cy: 300, neighbors: ["venetia", "serbia", "austria", "hungary"] },

  // --- IMPERIO RUSO (Lejano Este) ---
  baltic_states: { name: "Báltico", capital: "Riga", colorKey: "#339910", cx: 540, cy: 70, neighbors: ["east_prussia", "belarus"] },
  belarus: { name: "Bielorrusia", capital: "Smolensk", colorKey: "#336610", cx: 580, cy: 150, neighbors: ["poland", "baltic_states", "moscow", "ukraine"] },
  moscow: { name: "Moscú", capital: "Moscú", colorKey: "#6bce10", cx: 720, cy: 100, neighbors:  ["belarus", "ukraine"] },
  ukraine: { name: "Ucrania", capital: "Kiev", colorKey: "#cee763", cx: 690, cy: 200, neighbors: ["belarus", "moscow", "galicia", "moldavia"] },

  // --- SUR (Italia) ---
  piemonte: { name: "Piamonte", capital: "Turín", colorKey: "#068598", cx: 320, cy: 300, neighbors: ["france", "helvetia", "lombardia", "papal_states"] },
  lombardia: { name: "Lombardía", capital: "Milán", colorKey: "#cefa00", cx: 360, cy: 300, neighbors: ["piemonte", "venetia", "papal_states"] },
  venetia: { name: "Venecia", capital: "Venecia", colorKey: "#b24104", cx: 390, cy: 290, neighbors: ["piemonte", "austria", "dalmatia", "lombardia"] },
  papal_states: { name: "Est. Papales", capital: "Roma", colorKey: "#fece28", cx: 385, cy: 365, neighbors: ["piemonte", "lombardia", "venetia", "naples"] },
  naples: { name: "Nápoles", capital: "Nápoles", colorKey: "#1ad701", cx: 415, cy: 385, neighbors: ["papal_states", "tunisia"] },

  // --- SUR (Balcanes) ---
  serbia: { name: "Serbia", capital: "Belgrado", colorKey: "#ff9400", cx: 520, cy: 320, neighbors: ["hungary", "bulgaria", "greece", "bosnia"] },
  wallachia: { name: "Valaquia", capital: "Bucarest", colorKey: "#7be7e7", cx: 570, cy: 280, neighbors: ["hungary", "ukraine", "bulgaria"] },
  bulgaria: { name: "Bulgaria", capital: "Sofía", colorKey: "#ceade7", cx: 570, cy: 350, neighbors: ["serbia", "wallachia", "constantinople"] },
  greece: { name: "Grecia", capital: "Atenas", colorKey: "#33e7e7", cx: 570, cy: 435, neighbors: ["bulgaria", "serbia", "levant", "constantinople"] },

  // --- MEDITERRÁNEO Y ÁFRICA (Fondo) ---
  constantinople: { name: "Constantinopla", capital: "Estambul", colorKey: "#fd35c2", cx: 630, cy: 375, neighbors: ["bulgaria", "levant", "greece"] },
  levant: { name: "Levante", capital: "Jerusalén", colorKey: "#fd35c2", cx: 750, cy: 520, neighbors: ["constantinople", "egypt"] },
  egypt: { name: "Egipto", capital: "El Cairo", colorKey: "#d79801", cx: 650, cy: 570, neighbors: ["cyrenaica", "levant"] },
  cyrenaica: { name: "Cirenaica", capital: "Bengasi", colorKey: "#9bf868", cx: 495, cy: 510, neighbors: ["tunisia", "egypt"] },
  tunisia: { name: "Túnez", capital: "Túnez", colorKey: "#b98df5", cx: 340, cy: 460, neighbors: ["barbary", "naples", "cyrenaica"] },
  barbary: { name: "Barbary", capital: "Argel", colorKey: "#11ffb9", cx: 190, cy: 460, neighbors: ["spain", "tunisia"] },
};
