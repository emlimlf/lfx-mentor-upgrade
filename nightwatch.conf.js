module.exports = {
  src_folders: ['nightwatch/tests'],
  page_objects_path: ['nightwatch/page-objects'],

  webdriver: {
    start_process: true,
    server_path: require('chromedriver').path,
    port: 9515,
  },

  test_settings: {
    default: {
      screenshots: {
        enabled: true,
        on_failure: true,
        on_error: true,
        path: 'nightwatch/tests_output/screenshots',
      },
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
  },
};
