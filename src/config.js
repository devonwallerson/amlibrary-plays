const config = {
  developerToken: process.env.REACT_APP_APPLE_DEVELOPER_TOKEN,
  appName: process.env.REACT_APP_APP_NAME,
  appBuild: process.env.REACT_APP_APP_BUILD,
};

console.log('Config:', config); // Log the config to verify


export default config;
