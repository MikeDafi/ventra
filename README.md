# README: Fixing Node and Dependency Issues in Expo Projects

## Fix 1: Resolving Node.js Version Problems

- If your project encounters issues with older versions of Node.js, ensure you are using **Node.js 20**:
  - Install Node.js 20 using **nvm** (Node Version Manager):
    ```bash
    nvm install 20
    nvm use 20
    ```
  - Alternatively, create an `.nvmrc` file in your project root specifying the required version:
    ```bash
    echo "20" > .nvmrc
    ```
    Then, enforce the version:
    ```bash
    nvm use
    ```
  - If you are not using `nvm`, manually install Node.js 20 from the [official Node.js website](https://nodejs.org/) and ensure the new version is correctly set in your `PATH`.
  - Remove older Node.js versions from your `PATH` to prevent conflicts:
    ```bash
    which node  # Locate the Node.js binary path
    sudo rm -rf /path/to/old/node
    ```

## Fix 2: Upgrading Dependencies During `npx expo start`

- When running `npx expo start`, **do not ignore dependency upgrade suggestions**. Follow these steps:
  1. Copy the list of recommended dependency updates shown in the terminal.
  2. Use ChatGPT or any assistant to generate an `npm install` command for the optimized dependency suggestions.
  3. Run the command to install the recommended versions. For example:
     ```bash
     npm install expo-av@~15.0.1 expo-constants@~17.0.3 expo-font@~13.0.1 expo-linking@~7.0.2 expo-router@~4.0.5 expo-splash-screen@~0.29.10 expo-status-bar@~2.0.0 expo-system-ui@~4.0.3 expo-updates@~0.26.7 expo-web-browser@~14.0.1 react@18.3.1 react-dom@18.3.1 react-native@0.76.2 react-native-gesture-handler@~2.20.2 react-native-safe-area-context@4.12.0 react-native-screens@~4.0.0 @types/react@~18.3.12 jest-expo@~52.0.1
     ```
  4. Clear and reinstall dependencies to avoid conflicts:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

## Fix 3: Wrong Username logged in

- If a different user is logged in and you would rather not change your git credentials, you can do 
    ```bash
    git push https://MikeDafi:<TOKEN>@github.com/MikeDafi/ventra.git
   ```

