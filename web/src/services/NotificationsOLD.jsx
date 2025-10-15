// =================== PUSH NOTIFICATIONS SETUP ===================



const API_BASE = 'https://appybrain.skillade.com/api';


const REGISTER_ENDPOINT = `${API_BASE}/information/register_token`;


const REGISTER_PATH = '/api/information/register_token';





// Show alerts while app is in foreground


Notifications.setNotificationHandler({


  handleNotification: async () => ({


    shouldShowAlert: true,


    shouldPlaySound: true,


    shouldSetBadge: false,


  }),


};





function getProjectId() {


  // Try to fetch from EAS config


  const pid = Constants?.easConfig?.projectId || Constants?.expoConfig?.extra?.eas?.projectId;


  if (!pid) throw new Error('EAS projectId not found. Define in app.json/app.config or pass at runtime.');


  return pid;


}





async function ensureAndroidChannel() {


  if (Platform.OS === 'android') {


    await Notifications.setNotificationChannelAsync('default', {


      name: 'Geral',


      importance: Notifications.AndroidImportance.HIGH,


      sound: 'default',


      vibrationPattern: [0, 250, 250, 250],


      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,


    });


  }


}





async function askPermissions() {


  const settings = await Notifications.getPermissionsAsync();


  if (settings.status !== 'granted') {


    const req = await Notifications.requestPermissionsAsync();


    if (req.status !== 'granted') throw new Error('Notification permissions denied by user.');


  }


}





async function getExpoPushToken() {


  const projectId = getProjectId();


  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });


  if (!data) throw new Error('Failed to obtain Expo Push Token.');


  return data; // e.g. "ExponentPushToken[xxxxxxxxxxxx]"


}





async function getNativePushToken() {


  try {


    const dev = await Notifications.getDevicePushTokenAsync();


    const nativeType = dev?.type ?? null;


    const raw = dev?.data ?? dev?.token ?? null;


    return { nativeType, nativeToken: raw ?? null });


  } catch {


    return { nativeType: null, nativeToken: null };


  }


}





async function registerTokenOnBackend(expoPushToken, nativeType, nativeToken) {


  const deviceInfo = {


    platform: Platform.OS,


    model: Device.modelName ?? null,


    osVersion: Device.osVersion ?? null,


    brand: Device.brand ?? null,


    appVersion: Constants?.expoConfig?.version ?? null,


    buildNumber: Constants?.expoConfig?.ios?.buildNumber ?? Constants?.expoConfig?.android?.versionCode ?? null,


  });





  // Use authenticated request so backend receives Authorization + refresh headers


  const res = await makeAuthenticatedRequest(REGISTER_PATH, {


    method: 'POST',


    body: JSON.stringify({


      expoPushToken,


      nativeType,


      nativeToken,


      deviceInfo,


      isActive: 1,


    }),


  };





  const text = await res.text();


  let json = null;


  try { json = text ? JSON.parse(text) : null; } catch {}


  if (!res.ok || (json && json.success === false)) {


    const msg = json?.message || json?.error || text || `HTTP ${res.status}`;


    throw new Error(`register_token failed: ${msg}`);


  }


  return json ?? { ok: true };


}





function PushNotificationsRegistrar() {


  const { isAuthenticated } = useAuth();


  const completedRef = useRef(false);


  const retryCountRef = useRef(0);


  const appStateRef = useRef(AppState.currentState);





  const attemptRegister = React.useCallback(async () => {


    if (!isAuthenticated || completedRef.current) return;


    try {


      if (!Device.isDevice) {




        return;


      }




      await ensureAndroidChannel();





      // Check permission first


      const settings = await Notifications.getPermissionsAsync();


      if (settings.status !== 'granted') {




        const req = await Notifications.requestPermissionsAsync();


        if (req.status !== 'granted') {




          return; // Do not mark completed; we'll retry on foreground


        }


      }





      const expoPushToken = await getExpoPushToken();




      const { nativeType, nativeToken } = await getNativePushToken();







      const resp = await registerTokenOnBackend(expoPushToken, nativeType, nativeToken);




      completedRef.current = true;


    } catch (e) {


      retryCountRef.current += 1;




      // Basic backoff: try up to 3 times on this app session entry


      if (retryCountRef.current < 3) {


        setTimeout(() => {


          attemptRegister().catch(() => {});


        }, 2000 * retryCountRef.current);


      } else {




      }


    }


  }, [isAuthenticated]);





  useEffect(() => {


    if (isAuthenticated && !completedRef.current) {


      attemptRegister();


    }


  }, [isAuthenticated, attemptRegister]);





  // Re-attempt when app returns to foreground and we haven't completed


  useEffect(() => {


    const sub = AppState.addEventListener('change', (nextState) => {


      const prev = appStateRef.current;


      appStateRef.current = nextState;


      if (prev?.match(/inactive|background/) && nextState === 'active') {


        if (isAuthenticated && !completedRef.current) {




          attemptRegister();


        }


      }


    };


    return () => sub.remove();


  }, [isAuthenticated, attemptRegister]);


  return null;


}


// ================= END PUSH NOTIFICATIONS SETUP =================