import type {
  AdaptiveQuizRequest,
  AiAttemptAnalysis,
  AiExplanation,
  AiLessonQuestion,
  AiQuestion,
  AnalyzeAttemptRequest,
  ExplainRequest,
  GenerateLessonQuizRequest,
  GenerateQuestionsRequest,
  GenerateTopicQuizRequest,
} from "@/lib/ai/types";

/**
 * Deterministic stand-in for Gemini. Selected with AI_PROVIDER=mock so the
 * whole learning flow can be developed and tested without spending quota, and
 * used as the fallback when a real Gemini call fails.
 */

export function mockQuestions(
  request: GenerateQuestionsRequest,
): AiQuestion[] {
  const focus =
    request.weakTopicNames.length > 0
      ? request.weakTopicNames
      : request.topicNames.length > 0
        ? request.topicNames
        : [request.subjectName];

  return Array.from({ length: request.count }, (_, index) => {
    const topicName = focus[index % focus.length];
    const number = index + 1;

    if (request.questionType === "TRUE_FALSE") {
      return {
        prompt: `True or false: practising "${topicName}" regularly improves accuracy (practice item ${number}).`,
        questionType: "TRUE_FALSE" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: `Repeated practice on ${topicName} is how accuracy improves.`,
        topicName,
      };
    }

    if (request.questionType === "SHORT_ANSWER") {
      return {
        prompt: `In one sentence, describe the key idea behind "${topicName}" (practice item ${number}).`,
        questionType: "SHORT_ANSWER" as const,
        correctAnswer: topicName,
        explanation: `A good answer names the central concept of ${topicName}.`,
        topicName,
      };
    }

    const options = [
      `${topicName} — core idea`,
      `${topicName} — common mistake`,
      `Unrelated concept ${number}`,
      `None of the above`,
    ];

    return {
      prompt: `Which option best describes "${topicName}" at ${request.difficulty.toLowerCase()} difficulty (practice item ${number})?`,
      questionType: "MCQ" as const,
      options,
      correctAnswer: options[0],
      explanation: `The first option states the central idea of ${topicName}.`,
      topicName,
    };
  });
}

export function mockExplanation(request: ExplainRequest): AiExplanation {
  const topic = request.topicName ?? request.subjectName;

  return {
    whatWentWrong: `You answered "${request.studentAnswer}", which does not match the expected result.`,
    correctConcept: `The correct answer is "${request.correctAnswer}".`,
    explanation: `Re-read the question and apply the rule for ${topic} step by step. Comparing your working with the correct answer usually shows where the reasoning changed direction.`,
    learningTip: `Try two or three more ${topic} questions while the correction is fresh.`,
  };
}

/* -------------------------- lesson quiz mock ------------------------------ */

/**
 * Deterministic lesson quiz. Pulls short phrases out of the teacher's
 * material so questions look grounded even without a real model, and cycles
 * evenly through difficulties so the mock quiz is usable for testing the
 * whole review/grade/adapt pipeline.
 */
export function mockLessonQuiz(
  request: GenerateLessonQuizRequest,
): AiLessonQuestion[] {
  const sentences = request.material
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, request.count || 10);

  const difficulties: AiLessonQuestion["difficulty"][] = [
    "EASY",
    "MEDIUM",
    "HARD",
  ];

  return Array.from({ length: request.count }, (_, index) => {
    const seed = sentences[index % Math.max(sentences.length, 1)] ?? "";
    const concept = seed
      ? seed.split(" ").slice(0, 4).join(" ")
      : `${request.topicName} concept ${index + 1}`;

    const options = [
      `Correct: ${concept}`,
      `Distractor A for question ${index + 1}`,
      `Distractor B for question ${index + 1}`,
      `Distractor C for question ${index + 1}`,
    ];

    return {
      prompt: `Regarding ${request.topicName}: what best describes "${concept}"? (Q${index + 1})`,
      options,
      correctAnswer: options[0],
      explanation: `"${concept}" is the key idea being tested here, drawn from the lesson material.`,
      conceptTag: concept || request.topicName,
      difficulty: difficulties[index % difficulties.length],
    };
  });
}

/* --------------------------- attempt analysis mock ------------------------ */

export function mockAttemptAnalysis(
  request: AnalyzeAttemptRequest,
): AiAttemptAnalysis {
  const weak = request.conceptResults.filter((c) => c.level === "WEAK");
  const strong = request.conceptResults.filter((c) => c.level === "STRONG");

  const summary =
    weak.length === 0
      ? `Solid result at ${request.scorePercentage}% — every concept tested is at least average.`
      : `You scored ${request.scorePercentage}% overall. The number that matters more: ${weak
          .map((c) => c.conceptTag)
          .join(", ")} still ${weak.length === 1 ? "needs" : "need"} work, even where the total looks fine.`;

  return {
    summary,
    strongAreas: strong.map((c) => c.conceptTag),
    weakAreas: weak.map((c) => c.conceptTag),
    misconceptions:
      weak.length > 0
        ? `The incorrect answers suggest a mix-up in ${weak.map((c) => c.conceptTag).join(" and ")}. Reviewing a worked example for each should clear it up.`
        : "No consistent misconception stood out in the incorrect answers.",
    recommendations:
      weak.length > 0
        ? weak.map((c) => `Practise a few more questions on ${c.conceptTag}`)
        : ["Keep practising at the current difficulty to stay sharp."],
  };
}

/* ---------------------------- adaptive quiz mock --------------------------- */

export function mockAdaptiveQuiz(
  request: AdaptiveQuizRequest,
): AiLessonQuestion[] {
  const reviewCount = Math.max(
    0,
    Math.min(2, Math.round(request.count * 0.2)),
  );
  const focusCount = request.count - reviewCount;

  const focusConcepts =
    request.weakConcepts.length > 0 ? request.weakConcepts : [request.topicName];
  const reviewConcepts =
    request.reviewConcepts.length > 0 ? request.reviewConcepts : focusConcepts;

  const build = (concept: string, index: number): AiLessonQuestion => {
    const options = [
      `Correct: ${concept}`,
      `Distractor A for ${concept}`,
      `Distractor B for ${concept}`,
      `Distractor C for ${concept}`,
    ];

    return {
      prompt: `Targeted practice on ${concept} (Q${index + 1})`,
      options,
      correctAnswer: options[0],
      explanation: `This question revisits ${concept} at ${request.difficulty.toLowerCase()} difficulty.`,
      conceptTag: concept,
      difficulty: request.difficulty,
    };
  };

  const focusQuestions = Array.from({ length: focusCount }, (_, i) =>
    build(focusConcepts[i % focusConcepts.length], i),
  );
  const reviewQuestions = Array.from({ length: reviewCount }, (_, i) =>
    build(reviewConcepts[i % reviewConcepts.length], focusCount + i),
  );

  return [...focusQuestions, ...reviewQuestions];
}

/* --------------------------- topic-based quiz mock ------------------------- */

const CONCEPT_BANK: Record<string, string[]> = {
  Math: [
    "Order of operations (PEMDAS)",
    "Fraction addition with unlike denominators",
    "Linear equation solving for x",
    "Area of a triangle",
    "Ratio and proportion word problems",
    "Negative number arithmetic",
    "Percent increase / decrease",
    "Algebraic substitution",
    "Perimeter and area of composite shapes",
    "Probability of independent events",
    "Mean, median, mode comparison",
    "Equivalent fractions",
    "Decimal long division",
    "Pythagorean theorem basics",
  ],
  Science: [
    "Photosynthesis reactants vs products",
    "Newton's three laws of motion",
    "States of matter transitions",
    "Parts of a plant cell vs animal cell",
    "The water cycle stages",
    "Electrical conductors vs insulators",
    "Digestive system major organs",
    "Food chain trophic levels",
    "Solar system planet order",
    "Acid-base chemistry basics",
    "Force, mass, acceleration (F=ma)",
    "Ecosystem interdependence",
    "The rock cycle: igneous/sedimentary/metamorphic",
    "Circuit components in series vs parallel",
  ],
  English: [
    "Identifying the main idea in a paragraph",
    "Subject-verb agreement",
    "Comma usage in compound sentences",
    "Theme vs plot distinction",
    "Types of figurative language (simile, metaphor, personification)",
    "Tense consistency in a narrative",
    "Prefix / suffix / root word meanings",
    "Author's purpose: inform, persuade, entertain",
    "Context clues for vocabulary",
    "Characterization methods (direct, indirect)",
    "Story elements: setting, conflict, resolution",
    "Common homophones (there/their/they're)",
    "Transition words for essays",
    "Point of view: first vs third person",
  ],
};

const DEFAULT_CONCEPTS = [
  "Core definition",
  "Common examples",
  "Typical mistakes",
  "Step-by-step procedure",
  "Units and notation",
  "Real-world application",
  "Comparison with related concept A",
  "Comparison with related concept B",
  "Derived rule or shortcut",
  "Non-obvious edge case",
  "Underlying principle",
  "Alternative representation",
];

function pickConcepts(topic: string, subject: string, count: number): string[] {
  const bank =
    CONCEPT_BANK[subject] ??
    CONCEPT_BANK.Math;

  const combined = [
    ...bank.map((c) => `${c} in ${topic}`),
    ...DEFAULT_CONCEPTS.map((c) => `${c} for ${topic}`),
  ];

  const result: string[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(combined[i % combined.length]);
  }
  return result;
}

/**
 * Deterministic topic-based quiz generator. Produces the requested number of
 * MCQ questions with synthetic (but structurally valid) options and concept
 * tags. Difficulty rotates evenly so the preview screen is visually realistic.
 */
export function mockTopicQuiz(
  request: GenerateTopicQuizRequest,
): AiLessonQuestion[] {
  const concepts = pickConcepts(request.topic, request.subjectName, request.count);
  const difficulties: AiLessonQuestion["difficulty"][] = [
    "EASY",
    "MEDIUM",
    "HARD",
  ];

  return concepts.map((concept, index) => {
    const number = index + 1;
    const label = concept.length > 30 ? concept.slice(0, 27) + "..." : concept;

    const options = [
      `Correct: ${label}`,
      `Common distractor A (${request.topic} Q${number})`,
      `Common distractor B (${request.topic} Q${number})`,
      `None of the above`,
    ];

    return {
      prompt: `[${difficulties[index % difficulties.length]}] In the context of ${request.topic}, which statement best captures "${label}"? (Q${number})`,
      options,
      correctAnswer: options[0],
      explanation: `This question tests ${label}. Review the core definition of ${request.topic} and compare each distractor against the main idea.`,
      conceptTag: label,
      difficulty: difficulties[index % difficulties.length],
    };
  });
}
