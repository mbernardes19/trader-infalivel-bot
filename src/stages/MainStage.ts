import { Stage } from 'telegraf';
import welcomeScene from '../scenes/WelcomeScene';
import paymentScene from '../scenes/PaymentScene';
import planoScene from '../scenes/PlanoScene';
import nameScene from '../scenes/NameScene';
import phoneScene from '../scenes/PhoneScene';
import emailScene from '../scenes/EmailScene';
import analysisScene from '../scenes/AnalysisScene';

const stage = new Stage([welcomeScene, paymentScene, planoScene, nameScene, phoneScene, emailScene, analysisScene], { ttl: 1500 });

export default stage;