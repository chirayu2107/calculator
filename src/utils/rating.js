import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';

const USAGE_KEY = '@maidtracker:usage_days';
const LAST_OPENED_KEY = '@maidtracker:last_opened_date';
const HAS_RATED_KEY = '@maidtracker:has_rated';

export const checkAndPromptRating = async () => {
  if (Platform.OS === 'web') return; // Do not prompt on web
  
  try {
    const hasRated = await AsyncStorage.getItem(HAS_RATED_KEY);
    if (hasRated === 'true') return;

    const today = new Date().toDateString();
    const lastOpened = await AsyncStorage.getItem(LAST_OPENED_KEY);
    
    let usageDays = parseInt(await AsyncStorage.getItem(USAGE_KEY) || '0', 10);

    if (lastOpened !== today) {
      usageDays += 1;
      await AsyncStorage.setItem(USAGE_KEY, usageDays.toString());
      await AsyncStorage.setItem(LAST_OPENED_KEY, today);
    }

    if (usageDays >= 5) {
      Alert.alert(
        'Enjoying HomeStaff?',
        'Your feedback helps us improve! Would you mind taking a moment to rate us on the Play Store?',
        [
          { text: 'Remind Me Later', style: 'cancel' },
          { 
            text: 'Rate Now', 
            onPress: async () => {
              await AsyncStorage.setItem(HAS_RATED_KEY, 'true');
              // Replace with your actual package name when published
              Linking.openURL('market://details?id=com.maidtracker.app');
            } 
          }
        ]
      );
    }
  } catch (error) {
    console.error('Error checking rating prompt', error);
  }
};
