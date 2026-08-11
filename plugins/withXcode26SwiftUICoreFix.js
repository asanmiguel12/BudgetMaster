const { withXcodeProject, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Work around the Xcode 26 / iOS 26 SDK "SwiftUICore" linker failure.
 * See: https://github.com/KodeStar/audiosilo-frontend/blob/main/plugins/withXcode26SwiftUICoreFix.js
 */

const SWIFT_FLAG = '-Xfrontend -disable-autolink-framework -Xfrontend SwiftUICore';

function patchAppBuildSettings(buildSettings) {
  buildSettings.ENABLE_DEBUG_DYLIB = 'NO';
  let flags = buildSettings.OTHER_SWIFT_FLAGS;
  if (flags == null) flags = '"$(inherited)"';
  if (Array.isArray(flags)) flags = flags.join(' ');
  if (flags.includes('SwiftUICore')) return;
  buildSettings.OTHER_SWIFT_FLAGS = `"${flags.replace(/^"|"$/g, '')} ${SWIFT_FLAG}"`;
}

const withAppTargetFix = (config) =>
  withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const entry = configurations[key];
      if (entry && typeof entry === 'object' && entry.buildSettings) {
        patchAppBuildSettings(entry.buildSettings);
      }
    }
    return cfg;
  });

const POD_MARKER = '# xcode26-swiftuicore-fix';
const POD_SNIPPET = `    ${POD_MARKER}
    installer.pods_project.targets.each do |pod_target|
      pod_target.build_configurations.each do |bc|
        f = bc.build_settings['OTHER_SWIFT_FLAGS'] || '$(inherited)'
        f = f.join(' ') if f.is_a?(Array)
        unless f.include?('SwiftUICore')
          bc.build_settings['OTHER_SWIFT_FLAGS'] = "#{f} ${SWIFT_FLAG}"
        end
      end
    end
`;

const withPodfileFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(POD_MARKER)) {
        contents = contents.replace(/( *post_install do \|installer\|\n)/, `$1${POD_SNIPPET}`);
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);

module.exports = (config) => withPodfileFix(withAppTargetFix(config));
