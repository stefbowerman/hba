// jQuery
import $ from 'jquery';

// Core
import { credits } from './core/utils';
import * as Animations   from './core/animations';
import * as Breakpoints  from './core/breakpoints';

// Sections
import SectionManager    from './sections/sectionManager';
import PasswordSection   from './sections/password';

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

((Modernizr) => {
  const $body = $(document.body);

  const sectionManager = new SectionManager();

  sectionManager.register('password', PasswordSection);

  // Add "development mode" class for CSS hook
  $body.addClass('development-mode');

  credits();
})(Modernizr);
