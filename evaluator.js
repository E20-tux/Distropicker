// Store user answers during quiz
let userAnswers = {};

// Record user answer for a category
export function recordAnswer(category, answer) {
  userAnswers[category] = answer;
}

// Score a distro based on user answers
function scoreDistro(distro, answers) {
  let score = 0;
  const matchedConditions = [];
  const unmatchedConditions = [];

  // Proficiency & Familiarity: Low proficiency = prefer beginnerFriendly
  if (answers.Proficiency === 'I often need help from others to fix problems with my computer') {
    if (distro.beginnerFriendly) {
      score += 20;
      matchedConditions.push('Beginner-friendly distro');
    } else {
      unmatchedConditions.push('Not ideal for beginners');
    }
  } else if (answers.Proficiency === 'I can troubleshoot most or all computer problems by myself') {
    score += 5; // Any distro is fine, slight bonus if advanced
    if (!distro.beginnerFriendly) score += 10;
  }

  // Familiarity: Little knowledge = prefer beginner-friendly
  if (answers.Familiarity === 'I have little or no knowledge about Linux-based operating systems') {
    if (distro.beginnerFriendly) {
      score += 15;
      matchedConditions.push('Good for Linux beginners');
    } else {
      unmatchedConditions.push('Steep learning curve');
    }
  }

  // Live Mode preference
  if (answers['Use case']?.includes('Live Mode')) {
    if (distro.liveMode) {
      score += 15;
      matchedConditions.push('Has Live Mode support');
    } else {
      unmatchedConditions.push('No Live Mode available');
    }
  }

  // Privacy focus
  if (answers.Privacy === 'I do not want this') {
    if (distro.privacyFocus) {
      score += 20;
      matchedConditions.push('Privacy-focused');
    } else {
      unmatchedConditions.push('May collect data');
    }
  }

  // User Experience preferences
  if (answers['User Experience'] === 'I prefer a macOS-like user interface') {
    if (distro.desktop === 'Pantheon') {
      score += 15;
      matchedConditions.push('macOS-like interface (Pantheon)');
    }
  } else if (answers['User Experience'] === 'I prefer a windows-like user interface') {
    if (distro.desktop === 'Cinnamon' || distro.desktop === 'KDE Plasma') {
      score += 15;
      matchedConditions.push('Windows-like interface');
    }
  }

  // Use case matching
  if (answers['Use case']) {
    const useCase = answers['Use case'];
    if (distro.idealUseCases) {
      distro.idealUseCases.forEach(ideaUseCase => {
        if (useCase.includes('daily use') && ideaUseCase === 'daily use') {
          score += 15;
          matchedConditions.push('Great for daily use');
        }
        if (useCase.includes('gaming') && ideaUseCase === 'gaming') {
          score += 20;
          matchedConditions.push('Gaming support');
        }
        if (useCase.includes('anonymous') && ideaUseCase === 'privacy') {
          score += 25;
          matchedConditions.push('Anonymous browsing support');
        }
      });
    }
  }

  // Pre-installed applications / Scope
  if (answers.Scope === 'I want to choose the basic programs to install myself') {
    score += 5; // Minimal bonus for minimal-out-of-box distros
  } else if (answers.Scope === 'I prefer a Linux distribution shipping all the basic programs I need') {
    score += 5; // Minimal bonus for full-featured distros
  }

  // Updates preference
  if (answers.Updates === 'I prefer stable updates') {
    // Penalize rolling-release only distros
    if (distro.name === 'Arch Linux' || distro.name === 'Gentoo Linux') {
      score -= 10;
      unmatchedConditions.push('Rolling release (not stable)');
    }
  }

  return {
    distro,
    score,
    matchedConditions,
    unmatchedConditions
  };
}

// Get top 3 distro recommendations
export function getRecommendations(distrosData) {
  const recommendations = distrosData
    .map(distro => scoreDistro(distro, userAnswers))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return recommendations;
}