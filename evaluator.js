/**
 * DistroFinder Evaluator
 * Analyzes user answers and recommends the best Linux distributions
 */

/**
 * Evaluate user answers against available distributions
 * @param {Object} userAnswers - Object with category keys and selected answer indices
 * @param {Array} distros - Array of distribution objects
 * @returns {Array} - Top 3 recommended distros with scores
 */
export function evaluateAnswers(userAnswers, distros) {
  // Evaluate each distribution based on user answers
  const evaluatedDistros = distros.map(distro => {
    let matchDetails = {};

    // === PROFICIENCY LEVEL ===
    if (userAnswers.Proficiency !== undefined) {
      const proficiency = userAnswers.Proficiency;
      if (proficiency === 0) {
        // "I often need help" - highly beginner friendly required
        matchDetails.proficiency = distro.beginnerFriendly ? 'Excellent' : 'Poor';
      } else if (proficiency === 1) {
        // "Can solve some problems" - beginner friendly helpful
        matchDetails.proficiency = distro.beginnerFriendly ? 'Good' : 'Fair';
      } else if (proficiency === 2) {
        // "Can solve most problems" - all distros acceptable
        matchDetails.proficiency = 'Good';
      }
    }

    // === FAMILIARITY WITH LINUX ===
    if (userAnswers.Familiarity !== undefined) {
      const familiarity = userAnswers.Familiarity;
      if (familiarity === 0) {
        // "Little or no knowledge" - very beginner friendly needed
        matchDetails.familiarity = distro.beginnerFriendly ? 'Excellent' : 'Poor';
      } else if (familiarity === 1) {
        // "Used Linux before" - can handle most distros
        matchDetails.familiarity = distro.beginnerFriendly ? 'Good' : 'Fair';
      } else if (familiarity === 2) {
        // "Good understanding" - can use any distro
        matchDetails.familiarity = 'Fair';
      }
    }

    // === USE CASE ===
    if (userAnswers['Use case'] !== undefined) {
      const useCaseIndex = userAnswers['Use case'];
      const useCaseMap = {
        0: 'daily use',     // "daily use"
        1: 'privacy',       // "anonymous browsing" - privacy focus
        2: 'gaming',        // "games"
        3: 'containers',    // "isolated area" - containers/sandboxing
        4: 'accessibility', // "visually impaired"
        5: 'liveMode'       // "Live Mode"
      };

      const userUseCase = useCaseMap[useCaseIndex];

      if (userUseCase === 'daily use' && distro.idealUseCases.includes('daily use')) {
        matchDetails.useCase = 'Excellent match';
      } else if (userUseCase === 'daily use') {
        matchDetails.useCase = 'Fair match';
      } else if (userUseCase === 'privacy' && distro.privacyFocus) {
        matchDetails.useCase = 'Excellent - Privacy focused';
      } else if (userUseCase === 'gaming' && distro.idealUseCases.includes('gaming')) {
        matchDetails.useCase = 'Excellent - Gaming optimized';
      } else if (userUseCase === 'liveMode' && distro.liveMode) {
        matchDetails.useCase = 'Excellent - Has Live Mode';
      } else if (distro.idealUseCases.includes(userUseCase)) {
        matchDetails.useCase = 'Good match';
      }
    }

    //bloat
    if (userAnswers['Pre-installed applications'] !== undefined) {
      const preInstalled = userAnswers['Pre-installed applications'];
      if (preInstalled === 0) {
        // "default preset values"
        matchDetails.preinstalled = 'Wants defaults';
      } else if (preInstalled === 1) {
        // "choose settings myself"
        matchDetails.preinstalled = 'Wants customization';
      } else if (preInstalled === 2) {
        // "configure with graphical apps"
        matchDetails.preinstalled = 'Wants GUI tools';
      }
    }

    //UI preference
    if (userAnswers['User Experience'] !== undefined) {
      const uiPref = userAnswers['User Experience'];
      if (uiPref === 0) {
        // macOS-like UI
        const macOSLikeDEs = ['Pantheon', 'Budgie', 'KDE Plasma'];
        if (macOSLikeDEs.includes(distro.desktop)) {
          matchDetails.ui = 'macOS-like UI match';
        } else if (distro.desktop === 'GNOME') {
          matchDetails.ui = 'GNOME (somewhat similar)';
        }
      } else if (uiPref === 1) {
        // Windows-like UI
        const windowsLikeDEs = ['Cinnamon', 'MATE', 'Xfce', 'COSMIC', 'Zorin Desktop'];
        if (windowsLikeDEs.includes(distro.desktop)) {
          matchDetails.ui = 'Windows-like UI match';
        } else if (distro.desktop === 'GNOME') {
          matchDetails.ui = 'GNOME (somewhat similar)';
        }
      }
    }

    //open vs closed source
    if (userAnswers.Scope !== undefined) {
      const scope = userAnswers.Scope;
      if (scope === 0) {
        // "all basic programs included"
        matchDetails.scope = 'Comprehensive apps included';
      } else if (scope === 1) {
        // "choose programs myself"
        matchDetails.scope = 'Minimal/choice-based';
      }
    }

    //privacy
    if (userAnswers.Privacy !== undefined) {
      const privacy = userAnswers.Privacy;
      if (privacy === 0 && distro.privacyFocus) {
        // "Don't want online services"
        matchDetails.privacy = 'Privacy-focused match';
      } else if (privacy === 1) {
        // "OK with online services"
        matchDetails.privacy = 'Neutral';
      }
    }

    //downloading
    if (userAnswers.Administration !== undefined) {
      const admin = userAnswers.Administration;
      if (admin === 0) {
        // "App store" preference
        matchDetails.admin = 'Has app store support';
      } else if (admin === 1) {
        // "Willing to learn terminal"
        matchDetails.admin = 'Terminal capable';
      }
    }

    //updates
    if (userAnswers.Updates !== undefined) {
      const updates = userAnswers.Updates;
      if (updates === 0) {
        // "Prefer stable updates" - Ubuntu/Debian types better
        const stableDistros = ['Ubuntu', 'Kubuntu', 'Xubuntu', 'Lubuntu', 'Ubuntu MATE', 
                               'Ubuntu Budgie', 'Linux Mint', 'Zorin OS', 'elementary OS', 'Pop!_OS'];
        if (stableDistros.includes(distro.name)) {
          matchDetails.updates = 'Stable release model';
        } else {
          matchDetails.updates = 'Rolling release';
        }
      } else if (updates === 1) {
        // "Prefer fast updates" - rolling release better
        const rollingDistros = ['Arch Linux', 'Manjaro', 'EndeavourOS', 'Fedora'];
        if (rollingDistros.includes(distro.name)) {
          matchDetails.updates = 'Cutting-edge updates';
        } else {
          matchDetails.updates = 'Stable release cycle';
        }
      }
    }

    // === HELP PREFERENCE ===
    if (userAnswers.Help !== undefined) {
      const help = userAnswers.Help;
      if (help === 0) {
        // "Solve with guides/tutorials" - popular distros better
        const popularDistros = ['Ubuntu', 'Fedora', 'Arch Linux', 'Linux Mint', 'Manjaro'];
        if (popularDistros.includes(distro.name)) {
          matchDetails.help = 'Excellent community support';
        } else {
          matchDetails.help = 'Decent documentation';
        }
      } else if (help === 1) {
        // "Prefer asking others" - also popular distros better
        matchDetails.help = 'Community support level';
      }
    }

    return {
      name: distro.name,
      desktop: distro.desktop,
      packageManager: distro.packageManager,
      description: distro.description,
      website: distro.website,
      details: matchDetails
    };
  });

  // Return top 3 distros
  const topThree = evaluatedDistros
    .slice(0, 3);

  return topThree;
}

/**
 * Format recommendation results for display
 * @param {Array} recommendations - Array of top 3 recommended distros
 * @returns {string} - HTML string for display
 */
export function formatRecommendations(recommendations) {
  return recommendations.map((distro, index) => {
    return `
      <div class="recommendation-card">
        <div class="distro-info">
          <h3>${distro.name}</h3>
          <p class="description">${distro.description}</p>
          <div class="details">
            <p><strong>Desktop:</strong> ${distro.desktop}</p>
            <p><strong>Package Manager:</strong> ${distro.packageManager}</p>
          </div>
          <a href="${distro.website}" target="_blank" class="visit-btn">Visit Official Website →</a>
        </div>
      </div>
    `;
  }).join('');
}