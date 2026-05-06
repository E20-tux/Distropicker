export async function loadData() {
  const [quizResponse, distrosResponse] = await Promise.all([
    fetch('data.json'),
    fetch('distros.json')
  ]);

  if (!quizResponse.ok) {
    throw new Error('Failed to load data.json');
  }

  if (!distrosResponse.ok) {
    throw new Error('Failed to load distros.json');
  }

  const quizContent = await quizResponse.json();
  const distrosData = await distrosResponse.json();

  const quizData = Object.entries(quizContent).map(([category, content]) => ({
    category,
    question: content.q1,
    answers: Object.keys(content)
      .filter(key => key.startsWith('a'))
      .sort()
      .map(key => content[key])
  }));

  return { quizData, distrosData };
}
