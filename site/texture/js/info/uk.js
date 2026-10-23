// Information for the UK (SSEW) classes: AHDB hand-texturing key and soil
// management groups. Our wording of the cited AHDB pages.

const gritty = { en: 'The moist soil feels mainly rough and gritty', fr: 'Humide, la terre est surtout rugueuse au toucher' };
export const UK_FEEL = {
  S: { en: `${gritty.en}, and it does not stain the fingers.`, fr: `${gritty.fr}, et elle ne tache pas les doigts.` },
  LS: { en: `${gritty.en}, stains the fingers, and is hard to roll into a ball.`, fr: `${gritty.fr}, tache les doigts et se roule mal en boule.` },
  SL: { en: `${gritty.en}, rolls into a ball, but does not also feel smooth and silty.`, fr: `${gritty.fr}, se roule en boule, mais n’est pas en même temps douce et limoneuse.` },
  SSIL: { en: `${gritty.en}, rolls into a ball, and feels smooth and silty as well as gritty.`, fr: `${gritty.fr}, se roule en boule, et elle est douce et limoneuse en plus d’être rugueuse.` },
  SIL: { en: 'Not mainly gritty: it moulds into an easily deformed ball and feels smooth and silky (buttery).', fr: 'Pas surtout rugueuse : elle se moule en une boule qui se déforme facilement et elle est douce et soyeuse (onctueuse).' },
  SCL: { en: 'It moulds into a strong ball that smears but does not take a polish, and it is also rough and gritty.', fr: 'Elle se moule en une boule solide qui se laisse étaler sans devenir lisse et brillante, et elle est aussi rugueuse.' },
  SICL: { en: 'It moulds into a strong ball that smears but does not take a polish, and it is also smooth and buttery.', fr: 'Elle se moule en une boule solide qui se laisse étaler sans devenir lisse et brillante, et elle est aussi douce et onctueuse.' },
  CL: { en: 'It moulds into a strong ball that smears but does not take a polish, neither gritty nor buttery.', fr: 'Elle se moule en une boule solide qui se laisse étaler sans devenir lisse et brillante, ni rugueuse ni onctueuse.' },
  SC: { en: 'It moulds like plasticine, takes a polish and is very sticky when wet; also rough and gritty.', fr: 'Elle se modèle comme de la pâte à modeler, devient lisse et brillante et colle beaucoup mouillée ; aussi rugueuse.' },
  SIC: { en: 'It moulds like plasticine, takes a polish and is very sticky when wet; also smooth and buttery.', fr: 'Elle se modèle comme de la pâte à modeler, devient lisse et brillante et colle beaucoup mouillée ; aussi douce et onctueuse.' },
  C: { en: 'It moulds like plasticine, takes a polish and is very sticky when wet, neither gritty nor buttery.', fr: 'Elle se modèle comme de la pâte à modeler, devient lisse et brillante et colle beaucoup mouillée, ni rugueuse ni onctueuse.' },
};

const P = (en, fr) => ({ en, fr });
export const UK_GROUP_TEXT = {
  light: {
    name: P('Sandy and light soils (sand, loamy sand, sandy loam, sandy silt loam, silt loam).', 'Sols sableux et légers (sand, loamy sand, sandy loam, sandy silt loam, silt loam).'),
    short: P('Sandy and light soils', 'Sols sableux et légers'),
    points: [
      { title: P('Biology', 'Biologie'), text: P('Low capacity to hold organic matter. Add organic matter regularly to keep soil life active; composted material improves structure and stability; on very sandy soils, move to ley-arable rotations where possible.', 'Faible capacité à retenir la matière organique. Apportez-en régulièrement pour entretenir la vie du sol ; le compost améliore la structure et sa stabilité ; en sols très sableux, passez si possible à des rotations avec prairies temporaires.') },
      { title: P('Chemistry', 'Chimie'), text: P('Low cation exchange capacity: lime little and often to keep the pH, and match nutrient supply to crop demand.', 'Faible capacité d’échange cationique : chaulez peu et souvent pour tenir le pH, et ajustez les apports aux besoins des cultures.') },
      { title: P('Physics', 'Physique'), text: P('Significant drought risk. Avoid driving on wet subsoil; drain where groundwater is high.', 'Risque de sécheresse important. Évitez de circuler sur un sous-sol humide ; drainez là où la nappe est haute.') },
    ],
  },
  medium: {
    name: P('Medium soils (sandy clay loam, clay loam, silty clay loam).', 'Sols moyens (sandy clay loam, clay loam, silty clay loam).'),
    short: P('Medium soils', 'Sols moyens'),
    points: [
      { title: P('Biology', 'Biologie'), text: P('Organic matter changes slowly. Add it regularly, check levels at least every five years, and diversify the rotation.', 'La matière organique évolue lentement. Apportez-en régulièrement, contrôlez sa teneur au moins tous les cinq ans et diversifiez la rotation.') },
      { title: P('Chemistry', 'Chimie'), text: P('Some capacity to buffer changes in pH and nutrients: monitor pH, P and K regularly.', 'Une certaine capacité à tamponner pH et éléments : suivez régulièrement le pH, P et K.') },
      { title: P('Physics', 'Physique'), text: P('Assess the structure to know when the soil can be worked and driven on; time operations to limit damage; install and maintain drainage.', 'Observez la structure pour savoir quand le sol peut être travaillé et supporter les engins ; choisissez le bon moment pour limiter les dégâts ; installez et entretenez le drainage.') },
    ],
  },
  heavy: {
    name: P('Heavy soils (clay, sandy clay, silty clay).', 'Sols lourds (clay, sandy clay, silty clay).'),
    short: P('Heavy (clay) soils', 'Sols lourds (argileux)'),
    points: [
      { title: P('Biology', 'Biologie'), text: P('Naturally high in organic matter. Keep adding it, use composted material for structure and stability, and move to ley-arable rotations where possible.', 'Naturellement riches en matière organique. Continuez d’en apporter, utilisez du compost pour la structure et sa stabilité, et passez si possible à des rotations avec prairies temporaires.') },
      { title: P('Chemistry', 'Chimie'), text: P('High cation exchange capacity, and some clays have good potassium reserves: plan lime, P and K over the rotation and make good seedbeds so nutrients are used well.', 'Forte capacité d’échange cationique, et certaines argiles ont de bonnes réserves de potassium : raisonnez chaux, P et K sur la rotation et soignez le lit de semences pour bien valoriser les éléments.') },
      { title: P('Physics', 'Physique'), text: P('Waterlogging can be a major problem, especially without active roots: time operations well and install and maintain drainage.', 'L’engorgement peut être un problème majeur, surtout sans racines actives : choisissez bien le moment des interventions, installez et entretenez le drainage.') },
    ],
  },
};
