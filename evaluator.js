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

  // Proficiency: Low proficiency = prefer beginner-friendly
  if (answers.Proficiency) {
    if (answers.Proficiency === 'I often need help from others to fix computer problems') {
      if (distro.beginnerFriendly) {
        score += 25;
        matchedConditions.push('Beginner-friendly');
      } else {
        score -= 15;
        unmatchedConditions.push('Steep learning curve');
      }
    } else if (answers.Proficiency === 'I can solve some computer problems by myself') {
      score += 10;
      matchedConditions.push('Good for intermediate users');
    } else if (answers.Proficiency === 'I can troubleshoot most or all computer problems by myself') {
      if (!distro.beginnerFriendly) {
        score += 10;
        matchedConditions.push('Advanced customization available');
      }
    }
  }

  if (answers.Familiarity) {
    if (answers.Familiarity === 'I have little or no knowledge about Linux') {
      if (distro.beginnerFriendly) {
        score += 20;
        matchedConditions.push('Great for Linux beginners');
      } else {
        score -= 10;
        unmatchedConditions.push('Requires Linux knowledge');
      }
    } else if (answers.Familiarity === 'I have already used Linux for some purposes') {
      score += 5;
    } else if (answers.Familiarity === 'I have a good understanding of Linux') {
      score += 5;
      if (!distro.beginnerFriendly) {
        score += 5;
        matchedConditions.push('Suitable for experienced users');
      }
    }
  }

  // Desktop preference matching
  if (answers.Desktop) {
    if (answers.Desktop === 'macOS-like (modern and elegant)') {
      if (distro.desktop === 'Pantheon') {
        score += 20;
        matchedConditions.push('macOS-like interface (Pantheon)');
      }
    } else if (answers.Desktop === 'Windows-like (traditional taskbar)') {
      if (distro.desktop === 'Cinnamon' || distro.desktop === 'KDE Plasma' || distro.desktop === 'MATE') {
        score += 15;
        matchedConditions.push('Windows-like interface');
      }
    }
  }

  // Use case matching
  if (answers['Use case']) {
    const useCase = answers['Use case'];
    if (distro.idealUseCases) {
      if (useCase.includes('Daily use') && distro.idealUseCases.includes('daily use')) {
        score += 15;
        matchedConditions.push('Excellent for daily use');
      }
      if (useCase.includes('Gaming') && distro.idealUseCases.includes('gaming')) {
        score += 20;
        matchedConditions.push('Gaming optimized');
      }
      if (useCase.includes('development') && distro.idealUseCases.includes('development')) {
        score += 15;
        matchedConditions.push('Development friendly');
      }
      if (useCase.includes('Creative') && (distro.idealUseCases.includes('creative work') || distro.idealUseCases.includes('audio production') || distro.idealUseCases.includes('video editing'))) {
        score += 20;
        matchedConditions.push('Creative tools included');
      }
      if (useCase.includes('Server') && distro.idealUseCases.includes('servers')) {
        score += 20;
        matchedConditions.push('Server administration ready');
      }
      if (useCase.includes('customization') && distro.idealUseCases.includes('customization')) {
        score += 15;
        matchedConditions.push('Highly customizable');
      }
    }
  }

  // Installation preferences
  if (answers.Installation) {
    if (answers.Installation === 'Use default presets - I want minimal setup time') {
      if (distro.beginnerFriendly && distro.liveMode) {
        score += 10;
        matchedConditions.push('Easy installation process');
      }
    } else if (answers.Installation === 'I want complete control over configuration') {
      if (!distro.beginnerFriendly || distro.idealUseCases.includes('custom system builds')) {
        score += 15;
        matchedConditions.push('Full configuration control');
      }
    }
  }

  // Privacy focus
  if (answers.Privacy) {
    if (answers.Privacy === 'Privacy is critical - no data collection') {
      if (distro.privacyFocus) {
        score += 25;
        matchedConditions.push('Privacy-focused distribution');
      } else {
        score -= 5;
        unmatchedConditions.push('May include telemetry');
      }
    }
  }

  // Pre-installed applications / Scope
  // Software scope preferences
  if (answers.Software) {
    if (answers.Software === 'Full suite of programs - ready to use immediately') {
      if (distro.idealUseCases.includes('office work') || distro.idealUseCases.includes('daily use')) {
        score += 10;
        matchedConditions.push('Ships with essential software');
      }
    }
  }

  // Updates preference
  if (answers.Updates) {
    if (answers.Updates === 'Stable updates - fewer but tested changes') {
      if (distro.updateType === 'stable') {
        score += 20;
        matchedConditions.push('Stable release cycle');
      } else {
        score -= 10;
        unmatchedConditions.push('Rolling release (frequent updates)');
      }
    } else if (answers.Updates === 'Rolling updates - latest software frequently') {
      if (distro.updateType === 'rolling') {
        score += 20;
        matchedConditions.push('Latest software available');
      } else {
        score -= 5;
        unmatchedConditions.push('Slower update cycle');
      }
    }
  }

  // Help preference (community size is harder to quantify, so we use beginner-friendly as proxy)
  if (answers.Help) {
    if (answers.Help === 'I prefer using guides, wikis, and tutorials') {
      // Larger communities have better documentation
      if (distro.name === 'Ubuntu' || distro.name === 'Fedora' || distro.name === 'Linux Mint' || 
          distro.name === 'Arch Linux' || distro.name === 'Debian' || distro.name === 'Manjaro') {
        score += 15;
        matchedConditions.push('Large community with extensive documentation');
      }
    }
  }

  // Live mode bonus if user seems to value trying before installing
  if (distro.liveMode && distro.beginnerFriendly) {
    score += 5;
    matchedConditions.push('Can test via Live Mode');
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