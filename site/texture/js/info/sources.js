// Every source cited in the texture tab (triangle and jar test), one
// numbered list for both. Order = numbering on the page. Only documents that
// were actually opened while writing this tool.

export const SOURCES = [
  {
    id: 'ssm',
    text: 'Soil Science Division Staff (2017). Soil Survey Manual. USDA Handbook 18. Chapter 3, “Particle-size distribution” and “Definitions of soil texture classes and subclasses”, pp. 120–126: weight proportions from a laboratory analysis; pipette method preferred, hydrometer also used; field estimates to be checked against the laboratory.',
    url: 'https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual',
  },
  {
    id: 'neh652',
    text: 'USDA Natural Resources Conservation Service (1997). National Engineering Handbook, Part 652 Irrigation Guide, Chapter 2 Soils. Table 2–1 (available water capacity by texture), Table 2–5 (texture symbols), field descriptions of texture classes (p. 2–11 to 2–12), Exhibit 2–1.',
    url: 'https://www.irrigationtoolbox.com/NEH/Part652_NationalIrrigationGuide/ch2.pdf',
  },
  {
    id: 'fao56',
    text: 'Allen R.G., Pereira L.S., Raes D., Smith M. (1998). Crop evapotranspiration. FAO Irrigation and Drainage Paper 56. Chapter 7, Table 19 “Typical soil water characteristics for different soil types”.',
    url: 'https://www.fao.org/4/x0490e/x0490e0c.htm',
  },
  {
    id: 'thien',
    text: 'Presley D., Thien S. (2008). Estimating Soil Texture by Feel. Kansas State University, MF2852 (flow chart after Thien S.J. 1979, J. Agronomic Education 8:54–55; table “Soil properties related to texture”).',
    url: 'https://bookstore.ksre.ksu.edu/download/estimating-soil-texture-by-feel_MF2852',
  },
  {
    id: 'csu',
    text: 'Colorado State University Extension, Colorado Master Gardener GardenNotes #213 “Managing soil tilth”, #214 “Estimating soil texture”, #215 “Soil compaction” (reviewed 2022). #214 describes the jar method: detergent, 10–15 minutes of shaking, readings at 1 minute, 2 hours and when the water clears (1–3 days).',
    url: 'https://cmg.extension.colostate.edu/wp-content/uploads/sites/59/2024/10/2024-1-Soils-Full-Section.pdf',
  },
  {
    id: 'ahdb-texture',
    text: 'AHDB (UK). How to determine soil texture: texture classes with light / medium / heavy groupings, and the hand-texturing key (also in the Nutrient Management Guide RB209, Section 1, Figure 1.1, 2022).',
    url: 'https://ahdb.org.uk/knowledge-library/how-to-determine-soil-texture',
  },
  {
    id: 'ahdb-principles',
    text: 'AHDB (UK). Soil types and soil health principles (sandy, medium and heavy soils).',
    url: 'https://ahdb.org.uk/knowledge-library/soil-types-and-soil-health-principles',
  },
  {
    id: 'moeys',
    text: 'Moeys J. soiltexture: functions for soil texture plot, classification and transformation. R package 1.5.3 (CRAN). Class vertices of the UK (after Defra TAN 52, 2006), GEPPA and Aisne triangles, and their documentation.',
    url: 'https://cran.r-project.org/package=soiltexture',
  },
  {
    id: 'nrcs-feel',
    text: 'USDA NRCS. Guide to Texture by Feel (modified from S.J. Thien, 1979).',
    url: 'https://www.nrcs.usda.gov/sites/default/files/2022-11/texture-by-feel.pdf',
  },
  {
    id: 'cssc',
    text: 'Groupe de travail sur la classification des sols (1998). Le système canadien de classification des sols, 3e éd. Agriculture et Agroalimentaire Canada. Figure 42 (noms français des classes texturales) and table of particle sizes, pp. 163–164.',
    url: 'https://sis.agr.gc.ca/siscan/publications/manuals/1998-cssc-ed3/cssc3_manual.pdf',
  },
  {
    id: 'quebec',
    text: 'MELCCFP Québec (2023). Établissement de la stratigraphie du sol… Guide technique. Tableau 4.10 (USDA, SCCS and Québec names) and p. 57 (same class limits as USDA); remark that “limon” does not mean the same class in all French versions.',
    url: 'https://www.environnement.gouv.qc.ca/eau/eaux-usees/residences_isolees/guide-stratigraphie-sol.pdf',
  },
  {
    id: 'irda',
    text: 'IRDA (2024). Guide explicatif – Fiches de descriptions et d’interprétation des séries de sols du Québec. Tableau 9 (French names of the sand subclasses).',
    url: 'https://irda.qc.ca/media/xcnhc0au/irda-descriptionsinterpr%C3%A9tationseriessolsqu%C3%A9bec-guide-octobre2024.pdf',
  },
  {
    id: 'baize',
    text: 'Baize D. Granulométrie et diagrammes de texture. Les Mots de l’agronomie, INRAE. Figure 1 (particle-size fractions), figure 2 (Aisne triangle, after Jamagne 1967), figure 3 (GEPPA triangle and class groups), figure 6 (sensitivity to crusting, INRA Orléans).',
    url: 'https://mots-agronomie.inrae.fr/index.php?title=Granulom%C3%A9trie_et_diagrammes_de_texture',
  },
  {
    id: 'mots-limon',
    text: 'Baize D., Morlon P. Limon : le mot. Les Mots de l’agronomie, INRAE (meanings of “limon”; annex 5 on “loam” and “loameux”).',
    url: 'https://mots-agronomie.inrae.fr/index.php?title=Limon_:_le_mot',
  },
  {
    id: 'richer2008',
    text: 'Richer de Forges A., Feller C., Jamagne M., Arrouays D. (2008). Perdus dans le triangle des textures. Étude et Gestion des Sols 15(2): 97–111.',
    url: 'https://www.afes.fr/wp-content/uploads/2023/04/EGS_15_2_richerdeforges.pdf',
  },
  {
    id: 'agriconn',
    text: 'Agriconnaissances (Chambres d’agriculture). Estimation rapide du RU d’un sol (2021), p. 3: réserve utile and bulk density per Aisne class (Jamagne); slides “Détermination rapide d’une texture”: jar half full of soil, shake several minutes, 2 days of settling, worked example.',
    url: 'https://agriconnaissances.fr/fileadmin/user_upload/204_Eve-Agriconnaissances/Sol/Estimation_rapide_du_RU_d_un_sol.pdf',
  },
  {
    id: 'aforce',
    text: 'Brêthes A. (ONF) (2010). Évaluation de la réserve en eau des sols. Réseau AFORCE, slides 11–12 (“méthode de Jamagne”, Jamagne et al. 1977, and its limits).',
    url: 'https://reseau-aforce.fr/sites/reseau-aforce/files/2022-01/778875~1.PDF',
  },
  {
    id: 'bruand2002',
    text: 'Bruand A. et al. (2002). Estimation des propriétés de rétention en eau des sols : utilisation de classes de pédotransfert après stratifications texturale et texturo-structurale. Étude et Gestion des Sols 9(2): 105–122 (annex I on the Jamagne values).',
    url: 'https://www.afes.fr/wp-content/uploads/2023/04/EGS_9_2_bruand.pdf',
  },
  {
    id: 'aca',
    text: 'Viaux P. (2024). Les constituants physiques du sol. Académie d’agriculture de France, Encyclopédie, fiche 01.08.Q01.',
    url: 'https://academie-agriculture.fr/sites/default/files/publications/encyclopedie/constituants_physiques_du_sol.pdf',
  },
  {
    id: 'supagro',
    text: 'Institut Agro Montpellier (SupAgro), Pépites. Sol – Texture et travail du sol (feel test, behaviour of clayey, silty and sandy soils).',
    url: 'https://www.supagro.fr/ress-pepites/sol/co/2_1_TextureSol.html',
  },
  // The jar test.
  {
    id: 'clemson',
    text: 'Jeffers A., Clemson Cooperative Extension, HGIC 1656 “Soil texture analysis: the jar test” (rev. 2023): jar 1/3 soil, readings at 1 minute, 2 hours and 48 hours.',
    url: 'https://hgic.clemson.edu/factsheet/soil-texture-analysis-the-jar-test/',
  },
  {
    id: 'msu',
    text: 'Montana State University Extension Soil Fertility, “Soil texture jar test” (2021): straight-sided jar 1/3 soil, a teaspoon of dishwasher soap or water softener, sand at 1 minute, silt after 6 hours, clay at 24 hours.',
    url: 'https://landresources.montana.edu/soilfertility/html/SoilTextureJarTest.html',
  },
  {
    id: 'ucanr',
    text: 'University of California ANR, UrbanAg worksheet “Sedimentation test of soil texture” (2017): readings at 30 seconds and 30 minutes.',
    url: 'https://ucanr.edu/sites/UrbanAg/files/263165.pdf',
  },
  {
    id: 'ubc',
    text: 'UBC Wiki, “Soil texture – jar sedimentation method” (2020): sand after 40 seconds, silt after 6 hours; assumptions of Stokes’ law.',
    url: 'https://wiki.ubc.ca/Soil_Texture_-_Jar_Sedimentation_Method',
  },
  {
    id: 'ksu',
    text: 'Moorberg C., Crouse D. Soils Laboratory Manual, Kansas State University (CC BY 4.0), chapter “Soil texture and structure”: aggregates, dispersion with sodium hexametaphosphate, settling and Stokes’ law.',
    url: 'https://kstatelibraries.pressbooks.pub/soilslabmanual/chapter/soil-texture-and-structure/',
  },
  {
    id: 'baize-dispersion',
    text: 'Baize D. Granulométrie et diagrammes de texture, annex 2 “Le problème de la dispersion”. Les Mots de l’agronomie, INRAE.',
    url: 'https://mots-agronomie.inrae.fr/index.php?title=Granulom%C3%A9trie_et_diagrammes_de_texture_-_Annexe_2',
  },
  {
    id: 'photo',
    text: 'Photo: Chaojoker, “Հողի թեստ” (soil test), Wikimedia Commons, 2012, licence CC BY-SA 3.0; modified: resized for this page; shared under CC BY-SA 3.0.',
    url: 'https://commons.wikimedia.org/wiki/File:%D5%80%D5%B8%D5%B2%D5%AB_%D5%A9%D5%A5%D5%BD%D5%BF.JPG',
  },
];

export const sourceIndex = (id) => SOURCES.findIndex((s) => s.id === id) + 1;
