import { recordAnswer, getRecommendations } from './evaluator.js';

export async function loadData() {
  const [quizResponse, distrosResponse] = await Promise.all([
    fetch('./data.json'),
    fetch('./distros.json')
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

let quizData = [];
let distrosData = {};
let currentQuestion = 0;
let answers = {};

async function initializeQuiz() {
  try {
    const data = await loadData();
    quizData = data.quizData;
    distrosData = data.distrosData;
    answers = {};
    currentQuestion = 0;
    displayQuestion();
  } catch (error) {
    console.error('Error initializing quiz:', error);
    document.getElementById('question').textContent = 'Error loading quiz data';
  }
}

function displayQuestion() {
  if (currentQuestion >= quizData.length) {
    showResults();
    return;
  }

  const q = quizData[currentQuestion];
  document.getElementById('question').textContent = q.question;

  const answerButtons = document.getElementById('answer-buttons');
  answerButtons.innerHTML = '';

  q.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.textContent = answer;
    button.onclick = () => selectAnswer(index);
    answerButtons.appendChild(button);
  });

  document.getElementById('next-btn').disabled = !answers[currentQuestion];
}

function selectAnswer(index) {
  answers[currentQuestion] = index;
  document.getElementById('next-btn').disabled = false;

  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
    
  // Record the answer in evaluator
  const category = quizData[currentQuestion].category;
  const selectedAnswer = quizData[currentQuestion].answers[index];
  recordAnswer(category, selectedAnswer);
  });
}

function nextQuestion() {
  currentQuestion++;
  displayQuestion();
}

function showResults() {
  document.getElementById('quiz').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  
  const recommendations = getRecommendations(distrosData);

  const recommendationsDiv = document.getElementById('recommendations');
  recommendationsDiv.innerHTML = recommendations.map(rec => `
    <div class="recommendation">
      <h3>${rec.distro.name}</h3>
      <p><strong>Match Score: ${rec.score} points</strong></p>
      <p>${rec.distro.description}</p>
      <div class="distro-info">
        <strong>Desktop:</strong> ${rec.distro.desktop}<br>
        <strong>Package Manager:</strong> ${rec.distro.packageManager}
      </div>
      ${rec.matchedConditions.length > 0 ? `
        <div class="conditions">
          <p><strong>Why it's a good match:</strong></p>
          ${rec.matchedConditions.map(cond => `<div class="met">${cond}</div>`).join('')}
        </div>
      ` : ''}
      ${rec.unmatchedConditions.length > 0 ? `
        <div class="conditions">
          <p><strong>Considerations:</strong></p>
          ${rec.unmatchedConditions.map(cond => `<div class="unmet">${cond}</div>`).join('')}
        </div>
      ` : ''}
      <p><a href="${rec.distro.website}" target="_blank">Visit ${rec.distro.name} Website →</a></p>
    </div>
  `).join('');
}

function restartQuiz() {
  document.getElementById('quiz').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  initializeQuiz();
}

document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
document.getElementById('restart-btn')?.addEventListener('click', restartQuiz);

// Initialize quiz when page loads
initializeQuiz();