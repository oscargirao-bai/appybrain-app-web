// Shim for @react-native-async-storage/async-storage using localStorage

const AsyncStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage.getItem error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage.setItem error:', error);
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage.removeItem error:', error);
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('AsyncStorage.clear error:', error);
    }
  },
};

export default AsyncStorage;
