import AsyncStorage from "@react-native-async-storage/async-storage";
export const useLocalStorage = () => {
  const getItem = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return typeof value === "object" && value !== null
        ? JSON.parse(value)
        : value;
    } catch (error) {
      console.error("Error getting item from local storage", error);
      return null;
    }
  };

  const setItem = async (key: string, value: any) => {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error setting item in local storage", error);
    }
  };

  return { getItem, setItem };
};
