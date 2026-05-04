// Sociometry questions based on Moreno methodology
export const sociometryQuestions = [
  {
    id: "soc_1",
    text: "Если вашу группу будут расформировывать, с кем бы ты хотел продолжить совместно учиться в новом коллективе?",
    type: "positive" as const,
    maxSelections: 3,
  },
  {
    id: "soc_2",
    text: "Кого бы ты из класса пригласил на свой день рождения?",
    type: "positive" as const,
    maxSelections: 3,
  },
  {
    id: "soc_3",
    text: "С кем из своего класса ты пошёл бы в многодневный туристический поход?",
    type: "positive" as const,
    maxSelections: 3,
  },
]

// FIRO/OMO questions - 54 questions total, 6 scales (Ie, Iw, Ce, Cw, Ae, Aw)
// Scale: 1-6 (1 = никогда/редко, 6 = обычно/всегда)
export type FiroScale = "Ie" | "Iw" | "Ce" | "Cw" | "Ae" | "Aw"

export type QuestionOption = {
  value: number
  label: string
}

export type QuestionItem = {
  key: string
  number: number
  text: string
  scale: FiroScale
}

export type QuestionSection = {
  id: string
  title: string
  description: string
  helperText?: string
  questions: QuestionItem[]
  options: QuestionOption[]
}

export const firoQuestions = [
  // Inclusion expressed (Ie) - questions 1-9
  { id: "firo_1", text: "Я стараюсь быть вместе со всеми.", scale: "Ie", number: 1 },
  { id: "firo_2", text: "Я предоставляю другим решать вопрос о том, что необходимо сделать.", scale: "Ce", number: 2 },
  { id: "firo_3", text: "Я становлюсь членом различных групп.", scale: "Ie", number: 3 },
  { id: "firo_4", text: "Я стараюсь иметь близкие отношения с остальными членами групп.", scale: "Ae", number: 4 },
  {
    id: "firo_5",
    text: "Когда предоставляется случай, я склонен стать членом интересных организаций.",
    scale: "Ie",
    number: 5,
  },
  {
    id: "firo_6",
    text: "Я допускаю, чтобы другие оказывали сильное влияние на мою деятельность.",
    scale: "Cw",
    number: 6,
  },
  { id: "firo_7", text: "Я стараюсь включиться в неформальную общественную жизнь.", scale: "Ie", number: 7 },
  { id: "firo_8", text: "Я стараюсь иметь близкие и сердечные отношения с другими.", scale: "Ae", number: 8 },
  { id: "firo_9", text: "Я стараюсь привлечь других к своим планам.", scale: "Ie", number: 9 },

  // Control expressed (Ce) - continuing
  { id: "firo_10", text: "Я позволяю другим судить о том, что я делаю.", scale: "Cw", number: 10 },
  { id: "firo_11", text: "Я стараюсь быть среди людей.", scale: "Ie", number: 11 },
  { id: "firo_12", text: "Я стараюсь устанавливать с другими близкие и сердечные отношения.", scale: "Ae", number: 12 },
  {
    id: "firo_13",
    text: "Я склонен присоединяться к остальным всякий раз, когда делается что-то совместно.",
    scale: "Ie",
    number: 13,
  },
  { id: "firo_14", text: "Я легко подчиняюсь другим.", scale: "Cw", number: 14 },
  { id: "firo_15", text: "Я стараюсь избегать одиночества.", scale: "Ie", number: 15 },
  { id: "firo_16", text: "Я стараюсь участвовать в совместных мероприятиях.", scale: "Ie", number: 16 },

  // Affection expressed (Ae)
  { id: "firo_17", text: "Я стараюсь относиться к другим приятельски.", scale: "Ae", number: 17 },
  {
    id: "firo_18",
    text: "Я предоставляю другим решать вопрос о том, что необходимо сделать.",
    scale: "Cw",
    number: 18,
  },

  // Inclusion wanted (Iw)
  {
    id: "firo_19",
    text: "Мне нравится, когда другие приглашают меня участвовать в чём-нибудь.",
    scale: "Iw",
    number: 19,
  },
  {
    id: "firo_20",
    text: "Мне нравится, когда остальные люди относятся ко мне непосредственно и сердечно.",
    scale: "Aw",
    number: 20,
  },
  { id: "firo_21", text: "Я стараюсь оказывать сильное влияние на деятельность других.", scale: "Ce", number: 21 },
  {
    id: "firo_22",
    text: "Мне нравится, когда другие приглашают меня участвовать в их деятельности.",
    scale: "Iw",
    number: 22,
  },
  { id: "firo_23", text: "Мне нравится, когда другие относятся ко мне непосредственно.", scale: "Aw", number: 23 },
  {
    id: "firo_24",
    text: "Я стараюсь брать на себя руководство людьми, когда с ними что-то делаю.",
    scale: "Ce",
    number: 24,
  },
  { id: "firo_25", text: "Мне нравится, когда другие включают меня в свою деятельность.", scale: "Iw", number: 25 },
  {
    id: "firo_26",
    text: "Мне нравится, когда другие ведут себя со мной холодно и сдержанно.",
    scale: "Aw",
    number: 26,
  },
  { id: "firo_27", text: "Я стараюсь чтобы остальные делали то, что я хочу.", scale: "Ce", number: 27 },

  // Control wanted (Cw)
  {
    id: "firo_28",
    text: "Мне нравится, когда другие приглашают меня принять участие в их дебатах.",
    scale: "Iw",
    number: 28,
  },
  { id: "firo_29", text: "Я люблю, когда другие относятся ко мне по-приятельски.", scale: "Aw", number: 29 },
  {
    id: "firo_30",
    text: "Мне нравится, когда другие приглашают меня принять участие в их деятельности.",
    scale: "Iw",
    number: 30,
  },
  { id: "firo_31", text: "Мне нравится, когда окружающие относятся ко мне сдержанно.", scale: "Aw", number: 31 },
  { id: "firo_32", text: "В обществе я стараюсь играть главную роль.", scale: "Ce", number: 32 },
  {
    id: "firo_33",
    text: "Мне нравится, когда другие приглашают меня поучаствовать вместе с ними.",
    scale: "Iw",
    number: 33,
  },
  { id: "firo_34", text: "Мне нравится, когда люди относятся ко мне непосредственно.", scale: "Aw", number: 34 },
  {
    id: "firo_35",
    text: "Я люблю, когда другие приглашают меня принять участие в их деятельности.",
    scale: "Iw",
    number: 35,
  },
  {
    id: "firo_36",
    text: "Мне нравится, когда окружающие относятся ко мне холодно и сдержанно.",
    scale: "Aw",
    number: 36,
  },

  // Affection wanted (Aw)
  { id: "firo_37", text: "Я стараюсь оказывать сильное влияние на других людей.", scale: "Ce", number: 37 },
  { id: "firo_38", text: "Мне нравится, когда другие включают меня в их деятельность.", scale: "Iw", number: 38 },
  { id: "firo_39", text: "Мне нравится, когда люди устанавливают со мной близкие отношения.", scale: "Aw", number: 39 },
  { id: "firo_40", text: "Я люблю, когда люди приглашают меня участвовать в чём-нибудь.", scale: "Iw", number: 40 },
  {
    id: "firo_41",
    text: "Мне нравится, когда другие относятся ко мне непосредственно и сердечно.",
    scale: "Aw",
    number: 41,
  },
  { id: "firo_42", text: "Я стараюсь оказывать сильное влияние на деятельность других.", scale: "Ce", number: 42 },
  { id: "firo_43", text: "Мне нравится, когда мои друзья включают меня в свои дела.", scale: "Iw", number: 43 },
  {
    id: "firo_44",
    text: "Мне нравится, когда окружающие относятся ко мне сдержанно и прохладно.",
    scale: "Aw",
    number: 44,
  },
  { id: "firo_45", text: "Я пытаюсь иметь сильное влияние на других людей.", scale: "Ce", number: 45 },
  {
    id: "firo_46",
    text: "Мне нравится, когда другие приглашают меня поучаствовать в их деятельности.",
    scale: "Iw",
    number: 46,
  },
  {
    id: "firo_47",
    text: "Мне нравится, когда люди устанавливают со мной близкие эмоциональные отношения.",
    scale: "Aw",
    number: 47,
  },
  { id: "firo_48", text: "Я стараюсь захватить руководящую позицию по отношению к другим.", scale: "Ce", number: 48 },
  { id: "firo_49", text: "Мне нравится, когда люди приглашают меня присоединиться к ним.", scale: "Iw", number: 49 },
  { id: "firo_50", text: "Мне нравится, когда люди относятся ко мне холодно и сдержанно.", scale: "Aw", number: 50 },
  { id: "firo_51", text: "Я стараюсь, чтобы другие делали то, что я хочу.", scale: "Ce", number: 51 },
  {
    id: "firo_52",
    text: "Мне нравится, когда люди приглашают меня поучаствовать в их деятельности.",
    scale: "Iw",
    number: 52,
  },
  { id: "firo_53", text: "Мне нравится, когда близкие мне люди относятся ко мне тепло.", scale: "Aw", number: 53 },
  { id: "firo_54", text: "Я стараюсь оказать сильное влияние на других людей.", scale: "Ce", number: 54 },
]

export const firoScaleDescriptions = {
  Ie: {
    name: "Включение выраженное (Ie)",
    description:
      "Стремление принимать остальных, чтобы они имели интерес ко мне и принимали участие в моей деятельности.",
    fullName: "Inclusion expressed",
  },
  Iw: {
    name: "Включение требуемое (Iw)",
    description: "Стремление принадлежать к различным группам, быть включённым в деятельность других.",
    fullName: "Inclusion wanted",
  },
  Ce: {
    name: "Контроль выраженный (Ce)",
    description: "Стремление контролировать и влиять на окружающих, брать на себя ответственность.",
    fullName: "Control expressed",
  },
  Cw: {
    name: "Контроль требуемый (Cw)",
    description: "Потребность в зависимости, ожидание контроля и руководства со стороны окружающих.",
    fullName: "Control wanted",
  },
  Ae: {
    name: "Аффект выраженный (Ae)",
    description: "Стремление устанавливать близкие отношения с другими, проявлять тёплые чувства.",
    fullName: "Affection expressed",
  },
  Aw: {
    name: "Аффект требуемый (Aw)",
    description: "Стремление к тому, чтобы другие устанавливали близкие и тёплые отношения.",
    fullName: "Affection wanted",
  },
}

export const firoAnswerOptions = [
  { value: 1, label: "1 - Никогда" },
  { value: 2, label: "2 - Редко" },
  { value: 3, label: "3 - Иногда" },
  { value: 4, label: "4 - Часто" },
  { value: 5, label: "5 - Обычно" },
  { value: 6, label: "6 - Всегда" },
]

// FIRO grouped questionnaire structure based on the source OMO document.
export const firoFrequencyOptionsV2: QuestionOption[] = [
  { value: 1, label: "Обычно" },
  { value: 2, label: "Часто" },
  { value: 3, label: "Иногда" },
  { value: 4, label: "По случаю" },
  { value: 5, label: "Редко" },
  { value: 6, label: "Никогда" },
]

export const firoPeopleCountOptionsV2: QuestionOption[] = [
  { value: 1, label: "Большинству людей" },
  { value: 2, label: "Многим" },
  { value: 3, label: "Некоторым людям" },
  { value: 4, label: "Нескольким людям" },
  { value: 5, label: "Одному двум людям" },
  { value: 6, label: "Никому" },
]

export const firoGeneralInstruction = {
  title: "Общая инструкция к опроснику ОМО/FIRO",
  description:
    "В опроснике нет правильных и неправильных ответов. Похожие утверждения могут иметь разный смысл в разных блоках. Отвечайте на каждый пункт отдельно, учитывая инструкцию текущего блока.",
}

const firoQuestionItems: QuestionItem[] = firoQuestions.map((question) => ({
  key: question.id,
  number: question.number,
  text: question.text,
  scale: question.scale as FiroScale,
}))

function getFiroQuestionsInRange(start: number, end: number): QuestionItem[] {
  return firoQuestionItems.filter((question) => question.number >= start && question.number <= end)
}

export const firoQuestionSections: QuestionSection[] = [
  {
    id: "firo-block-1",
    title: "Блок 1: вопросы 1–16",
    description:
      "Для каждого утверждения выберите ответ, который больше всего вам подходит:\n(1) Обычно                    (4) По случаю\n(2) Часто                     (5) Редко\n(3) Иногда                    (6) Никогда",
    questions: getFiroQuestionsInRange(1, 16),
    options: firoFrequencyOptionsV2,
  },
  {
    id: "firo-block-2",
    title: "Блок 2: вопросы 17–27",
    description:
      "Для каждого из дальнейших утверждений выберите один из ответов,\nобозначающий количество людей, которые могут влиять на вас или на которых\nваше поведение может распространяться. Относится к:\n(1) Большинству людей         (4) Нескольким людям\n(2) Многим                    (5) Одному двум людям\n(3) Некоторым людям           (6) Никому",
    questions: getFiroQuestionsInRange(17, 27),
    options: firoPeopleCountOptionsV2,
  },
  {
    id: "firo-block-3",
    title: "Блок 3: вопросы 28–40",
    description:
      "Для каждого из дальнейших утверждений выберите один из ответов,\nобозначающий количество людей, которые могут влиять на вас, или на которых\nваше поведение распространяется.\n(1) Большинству людей         (4) Нескольким людям\n(2) Многим                    (5) Одному двум людям\n(3) Некоторым людям           (6) Никому",
    questions: getFiroQuestionsInRange(28, 40),
    options: firoPeopleCountOptionsV2,
  },
  {
    id: "firo-block-4",
    title: "Блок 4: вопросы 41–54",
    description:
      "Для каждого из дальнейших утверждений выберите один из следующих ответов.\n(1) Обычно                    (4) По случаю\n(2) Часто                     (5) Редко\n(3) Иногда                    (6) Никогда",
    questions: getFiroQuestionsInRange(41, 54),
    options: firoFrequencyOptionsV2,
  },
]
