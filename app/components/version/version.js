'use strict';

angular.module('magicBuddy.version', [
  'magicBuddy.version.interpolate-filter',
  'magicBuddy.version.version-directive'
])

.value('version', '0.1');
