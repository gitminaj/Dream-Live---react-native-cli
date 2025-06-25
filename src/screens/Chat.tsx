import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {useRoute} from '@react-navigation/native';
import {socket} from '../utils/socket';
import {BACKEND_URL, BASE_URL} from '../utils/constant';
import axios from 'axios';
import {getDataFromStore} from '../store';
import {UserContext} from '../utils/context/user-context';

const {width} = Dimensions.get('window');

const emojiCategories = [
  {
    title: 'Smileys & People',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '😂',
      '🤣',
      '😊',
      '😇',
      '🙂',
      '🙃',
      '😉',
      '😌',
      '😍',
      '🥰',
      '😘',
      '😗',
      '😙',
      '😚',
      '😋',
      '😛',
      '😝',
      '😜',
      '🤪',
      '🤨',
      '🧐',
      '🤓',
      '😎',
      '🤩',
      '🥳',
      '😏',
      '😒',
      '😞',
      '😔',
      '😟',
      '😕',
      '🙁',
      '☹️',
      '😣',
      '😖',
      '😫',
      '😩',
      '🥺',
      '😢',
      '😭',
      '😤',
      '😠',
      '😡',
      '🤬',
      '🤯',
      '😳',
      '🥵',
      '🥶',
      '😱',
      '😨',
      '😰',
      '😥',
      '😓',
      '🤗',
      '🤔',
      '🤭',
      '🤫',
      '🤥',
      '😶',
      '😐',
      '😑',
      '😬',
      '🙄',
      '😯',
      '😦',
      '😧',
      '😮',
      '😲',
      '🥱',
      '😴',
      '🤤',
      '😪',
      '😵',
      '🤐',
      '🥴',
      '🤢',
      '🤮',
      '🤧',
      '😷',
      '🤒',
      '🤕',
    ],
  },
  {
    title: 'Animals & Nature',
    emojis: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐽',
      '🐸',
      '🐵',
      '🙈',
      '🙉',
      '🙊',
      '🐒',
      '🐔',
      '🐧',
      '🐦',
      '🐤',
      '🐣',
      '🐥',
      '🦆',
      '🦅',
      '🦉',
      '🦇',
      '🐺',
      '🐗',
      '🐴',
      '🦄',
      '🐝',
      '🐛',
      '🦋',
      '🐌',
      '🐞',
      '🐜',
      '🦟',
      '🦗',
      '🕷️',
      '🦂',
      '🐢',
      '🐍',
      '🦎',
      '🦖',
      '🦕',
      '🐙',
      '🦑',
      '🦐',
      '🦞',
      '🦀',
      '🐡',
      '🐠',
      '🐟',
      '🐬',
      '🐳',
      '🐋',
      '🦈',
      '🐊',
      '🐅',
      '🐆',
      '🦓',
      '🦍',
      '🦧',
      '🐘',
      '🦛',
      '🦏',
      '🐪',
      '🐫',
      '🦒',
      '🦘',
      '🐃',
      '🐂',
      '🐄',
      '🐎',
      '🐖',
      '🐏',
      '🐑',
      '🦙',
      '🐐',
      '🦌',
      '🐕',
      '🐩',
      '🦮',
      '🐕‍🦺',
      '🐈',
      '🐓',
      '🦃',
      '🦚',
      '🦜',
      '🦢',
      '🦩',
      '🕊️',
      '🐇',
      '🦝',
      '🦨',
      '🦡',
      '🦦',
      '🦥',
      '🐁',
      '🐀',
      '🐿️',
      '🦔',
    ],
  },
  {
    title: 'Food & Drink',
    emojis: [
      '🍏',
      '🍎',
      '🍐',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🍓',
      '🫐',
      '🍈',
      '🍒',
      '🍑',
      '🥭',
      '🍍',
      '🥥',
      '🥝',
      '🍅',
      '🍆',
      '🥑',
      '🥦',
      '🥬',
      '🥒',
      '🌶️',
      '🫑',
      '🌽',
      '🥕',
      '🫒',
      '🧄',
      '🧅',
      '🥔',
      '🍠',
      '🥐',
      '🥯',
      '🍞',
      '🥖',
      '🥨',
      '🧀',
      '🥚',
      '🍳',
      '🧈',
      '🥞',
      '🧇',
      '🥓',
      '🥩',
      '🍗',
      '🍖',
      '🦴',
      '🌭',
      '🍔',
      '🍟',
      '🍕',
      '🫓',
      '🥪',
      '🥙',
      '🧆',
      '🌮',
      '🌯',
      '🫔',
      '🥗',
      '🥘',
      '🫕',
      '🥫',
      '🍝',
      '🍜',
      '🍲',
      '🍛',
      '🍣',
      '🍱',
      '🥟',
      '🦪',
      '🍤',
      '🍙',
      '🍚',
      '🍘',
      '🍥',
      '🥠',
      '🥮',
      '🍢',
      '🍡',
      '🍧',
      '🍨',
      '🍦',
      '🥧',
      '🧁',
      '🍰',
      '🎂',
      '🍮',
      '🍭',
      '🍬',
      '🍫',
      '🍿',
      '🍩',
      '🍪',
      '🌰',
      '🥜',
      '🍯',
      '🥛',
      '🍼',
      '☕',
      '🍵',
      '🧃',
      '🥤',
      '🍶',
      '🍺',
      '🍻',
      '🥂',
      '🍷',
      '🥃',
      '🍸',
      '🍹',
      '🧉',
      '🍾',
    ],
  },
  {
    title: 'Activities',
    emojis: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🥎',
      '🎾',
      '🏐',
      '🏉',
      '🥏',
      '🎱',
      '🪀',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
      '🏏',
      '🪃',
      '🥅',
      '⛳',
      '🪁',
      '🏹',
      '🎣',
      '🤿',
      '🥊',
      '🥋',
      '🎽',
      '🛹',
      '🛷',
      '⛸️',
      '🥌',
      '🎿',
      '⛷️',
      '🏂',
      '🪂',
      '🏋️‍♀️',
      '🏋️',
      '🏋️‍♂️',
      '🤼‍♀️',
      '🤼',
      '🤼‍♂️',
      '🤸‍♀️',
      '🤸',
      '🤸‍♂️',
      '⛹️‍♀️',
      '⛹️',
      '⛹️‍♂️',
      '🤺',
      '🤾‍♀️',
      '🤾',
      '🤾‍♂️',
      '🏌️‍♀️',
      '🏌️',
      '🏌️‍♂️',
      '🏇',
      '🧘‍♀️',
      '🧘',
      '🧘‍♂️',
      '🏄‍♀️',
      '🏄',
      '🏄‍♂️',
      '🏊‍♀️',
      '🏊',
      '🏊‍♂️',
      '🤽‍♀️',
      '🤽',
      '🤽‍♂️',
      '🚣‍♀️',
      '🚣',
      '🚣‍♂️',
      '🧗‍♀️',
      '🧗',
      '🧗‍♂️',
      '🚵‍♀️',
      '🚵',
      '🚵‍♂️',
      '🚴‍♀️',
      '🚴',
      '🚴‍♂️',
      '🏆',
      '🥇',
      '🥈',
      '🥉',
      '🏅',
      '🎖️',
      '🏵️',
      '🎗️',
      '🎫',
      '🎟️',
      '🎪',
      '🤹‍♀️',
      '🤹',
      '🤹‍♂️',
      '🎭',
      '🩰',
      '🎨',
      '🎬',
      '🎤',
      '🎧',
      '🎼',
      '🎹',
      '🥁',
      '🪘',
      '🎷',
      '🎺',
      '🎸',
      '🪕',
      '🎻',
      '🎲',
      '♟️',
      '🎯',
      '🎳',
      '🎮',
      '🎰',
      '🧩',
    ],
  },
  {
    title: 'Travel & Places',
    emojis: [
      '🚗',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🏎️',
      '🚓',
      '🚑',
      '🚒',
      '🚐',
      '🛻',
      '🚚',
      '🚛',
      '🚜',
      '🏍️',
      '🛵',
      '🚲',
      '🛴',
      '🛹',
      '🛼',
      '🚁',
      '🛸',
      '✈️',
      '🛩️',
      '🛫',
      '🛬',
      '🪂',
      '💺',
      '🚀',
      '🛰️',
      '🚉',
      '🚊',
      '🚝',
      '🚞',
      '🚋',
      '🚃',
      '🚋',
      '🚞',
      '🚝',
      '🚄',
      '🚅',
      '🚈',
      '🚂',
      '🚆',
      '🚇',
      '🚊',
      '🚉',
      '✈️',
      '🛫',
      '🛬',
      '🛩️',
      '💺',
      '🛰️',
      '🚀',
      '🛸',
      '🚁',
      '🛶',
      '⛵',
      '🚤',
      '🛥️',
      '🛳️',
      '⛴️',
      '🚢',
      '⚓',
      '⛽',
      '🚧',
      '🚨',
      '🚥',
      '🚦',
      '🛑',
      '🚏',
      '🗺️',
      '🗿',
      '🗽',
      '🗼',
      '🏰',
      '🏯',
      '🏟️',
      '🎡',
      '🎢',
      '🎠',
      '⛲',
      '⛱️',
      '🏖️',
      '🏝️',
      '🏜️',
      '🌋',
      '⛰️',
      '🏔️',
      '🗻',
      '🏕️',
      '⛺',
      '🏠',
      '🏡',
      '🏘️',
      '🏚️',
      '🏗️',
      '🏭',
      '🏢',
      '🏬',
      '🏣',
      '🏤',
      '🏥',
      '🏦',
      '🏨',
      '🏪',
      '🏫',
      '🏩',
      '💒',
      '🏛️',
      '⛪',
      '🕌',
      '🕍',
      '🛕',
      '🕋',
      '⛩️',
      '🛤️',
      '🛣️',
      '🗾',
      '🎑',
      '🏞️',
      '🌅',
      '🌄',
      '🌠',
      '🎇',
      '🎆',
      '🌇',
      '🌆',
      '🏙️',
      '🌃',
      '🌌',
      '🌉',
      '🌁',
    ],
  },
  {
    title: 'Objects',
    emojis: [
      '⌚',
      '📱',
      '📲',
      '💻',
      '⌨️',
      '🖥️',
      '🖨️',
      '🖱️',
      '🖲️',
      '🕹️',
      '🗜️',
      '💽',
      '💾',
      '💿',
      '📀',
      '📼',
      '📷',
      '📸',
      '📹',
      '🎥',
      '📽️',
      '🎞️',
      '📞',
      '☎️',
      '📟',
      '📠',
      '📺',
      '📻',
      '🎙️',
      '🎚️',
      '🎛️',
      '🧭',
      '⏱️',
      '⏲️',
      '⏰',
      '🕰️',
      '⌛',
      '⏳',
      '📡',
      '🔋',
      '🔌',
      '💡',
      '🔦',
      '🕯️',
      '🪔',
      '🧯',
      '🛢️',
      '💸',
      '💵',
      '💴',
      '💶',
      '💷',
      '💰',
      '💳',
      '💎',
      '⚖️',
      '🧰',
      '🔧',
      '🔨',
      '⚒️',
      '🛠️',
      '⛏️',
      '🔩',
      '⚙️',
      '🧱',
      '⛓️',
      '🧲',
      '🔫',
      '💣',
      '🧨',
      '🪓',
      '🔪',
      '🗡️',
      '⚔️',
      '🛡️',
      '🚬',
      '⚰️',
      '⚱️',
      '🏺',
      '🔮',
      '📿',
      '🧿',
      '💈',
      '⚗️',
      '🔭',
      '🔬',
      '🕳️',
      '🩹',
      '🩺',
      '💊',
      '💉',
      '🧬',
      '🦠',
      '🧫',
      '🧪',
      '🌡️',
      '🧹',
      '🧺',
      '🧻',
      '🚽',
      '🚰',
      '🚿',
      '🛁',
      '🛀',
      '🧼',
      '🪒',
      '🧽',
      '🧴',
      '🛎️',
      '🔑',
      '🗝️',
      '🚪',
      '🪑',
      '🛏️',
      '🛋️',
      '🪞',
      '🚿',
      '🛁',
      '🚽',
      '🧻',
      '🧺',
      '🧹',
      '🧼',
      '🪒',
      '🧽',
      '🧴',
      '🛎️',
      '🔑',
      '🗝️',
      '🚪',
      '🪑',
      '🛏️',
      '🛋️',
      '🪞',
    ],
  },
  {
    title: 'Symbols',
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '💟',
      '☮️',
      '✝️',
      '☪️',
      '🕉️',
      '☸️',
      '✡️',
      '🔯',
      '🕎',
      '☯️',
      '☦️',
      '🛐',
      '⛎',
      '♈',
      '♉',
      '♊',
      '♋',
      '♌',
      '♍',
      '♎',
      '♏',
      '♐',
      '♑',
      '♒',
      '♓',
      '🆔',
      '⚛️',
      '🉑',
      '☢️',
      '☣️',
      '📴',
      '📳',
      '🈶',
      '🈚',
      '🈸',
      '🈺',
      '🈷️',
      '✴️',
      '🆚',
      '💮',
      '🉐',
      '㊙️',
      '㊗️',
      '🈴',
      '🈵',
      '🈹',
      '🈲',
      '🅰️',
      '🅱️',
      '🆎',
      '🆑',
      '🅾️',
      '🆘',
      '❌',
      '⭕',
      '🛑',
      '⛔',
      '📛',
      '🚫',
      '💯',
      '💢',
      '♨️',
      '🚷',
      '🚯',
      '🚳',
      '🚱',
      '🔞',
      '📵',
      '🚭',
      '❗',
      '❕',
      '❓',
      '❔',
      '‼️',
      '⁉️',
      '🔅',
      '🔆',
      '〽️',
      '⚠️',
      '🚸',
      '🔱',
      '⚜️',
      '🔰',
      '♻️',
      '✅',
      '🈯',
      '💹',
      '❇️',
      '✳️',
      '❎',
      '🌐',
      '💠',
      'Ⓜ️',
      '🌀',
      '💤',
      '🏧',
      '🚾',
      '♿',
      '🅿️',
      '🈳',
      '🈂️',
      '🛂',
      '🛃',
      '🛄',
      '🛅',
      '🚹',
      '🚺',
      '🚼',
      '🚻',
      '🚮',
      '🎦',
      '📶',
      '🈁',
      '🔣',
      'ℹ️',
      '🔤',
      '🔡',
      '🔠',
      '🆖',
      '🆗',
      '🆙',
      '🆒',
      '🆕',
      '🆓',
      '0️⃣',
      '1️⃣',
      '2️⃣',
      '3️⃣',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '🔟',
    ],
  },
];


const CustomEmojiPicker = ({onEmojiSelected, onClose}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [pressedEmoji, setPressedEmoji] = useState(null);

  const renderEmoji = (emoji, index) => (
    <TouchableOpacity
      key={`${emoji}-${index}`}
      style={[
        styles.emojiItem,
        pressedEmoji === emoji && styles.emojiItemPressed,
      ]}
      onPress={() => onEmojiSelected(emoji)}
      onPressIn={() => setPressedEmoji(emoji)}
      onPressOut={() => setPressedEmoji(null)}
      activeOpacity={0.7}>
      <Text style={styles.emojiText}>{emoji}</Text>
    </TouchableOpacity>
  );

  const renderCategory = (category, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.categoryTab,
        selectedCategory === index && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(index)}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === index && styles.selectedCategoryTabText,
        ]}>
        {category.emojis[0]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.emojiPickerContainer}>
      <View style={styles.emojiPickerHeader}>
        <Text style={styles.emojiPickerTitle}>
          {emojiCategories[selectedCategory].title}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          activeOpacity={0.7}>
          <MaterialIcons name="close" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.categoryTabs}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 8}}>
        {emojiCategories.map(renderCategory)}
      </ScrollView>

      <ScrollView
        style={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}>
        <View style={styles.emojiContainer}>
          {emojiCategories[selectedCategory].emojis.map((emoji, index) =>
            renderEmoji(emoji, index),
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function ChatScreen() {
  const route = useRoute();
  const {roomId, receiverUserId, roomDetails} = route.params;
  const {user} = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [receiverInfo, setReceiverInfo] = useState();
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const flatListRef = useRef();
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const attachmentModalAnimation = useRef(new Animated.Value(0)).current;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  console.log('route params', roomId, receiverUserId, roomDetails);

  useEffect(() => {
    const initialReceiver = roomDetails?.data?.participants.find(
      user => user._id === receiverUserId,
    );
    setReceiverInfo(initialReceiver);
    console.log(receiverInfo);
  }, [receiverUserId, roomDetails]);

  const formatLastSeen = info => {
    if (!info) return '';

    if (info.isOnline) return 'Online';

    const last = new Date(info.lastSeen);
    const now = new Date();

    const sameDay = last.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = last.toDateString() === yesterday.toDateString();

    if (sameDay) {
      return `Last seen today at ${last.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (isYesterday) {
      return `Last seen yesterday at ${last.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      return `Last seen ${diffDays} days ago`;
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const sendMessageWithAttachment = async (
    fileUri,
    fileName,
    fileType,
    messageType,
  ) => {
    try {
      const token = await getDataFromStore('token');
      const formData = new FormData();

      // Append file
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      });

      // Append other message data
      formData.append('senderId', currentUserId);
      formData.append('messageType', messageType);
      // Don't set default content, let it be empty or set appropriate content
      if (messageType !== 'image' && messageType !== 'video') {
        formData.append('content', '');
      }

      console.log('formdata', formData);

      const response = await axios.post(
        `${BASE_URL}/chat/rooms/${roomId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Send attachment error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  const handleAttachmentSelect = type => {
    hideAttachmentModal();

    switch (type) {
      case 'camera':
        openCamera();
        break;
      case 'gallery':
        openGallery();
        break;
      case 'video':
        openVideoGallery();
        break;
      default:
        break;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1080,
      maxHeight: 1080,
    };

    launchCamera(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        sendAttachment(response.assets[0], 'image');
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1080,
      maxHeight: 1080,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        sendAttachment(response.assets[0], 'image');
      }
    });
  };

  const openVideoGallery = () => {
    const options = {
      mediaType: 'video',
      quality: 0.8,
      videoQuality: 'medium',
      durationLimit: 60, // 60 seconds limit
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        sendAttachment(response.assets[0], 'video');
      }
    });
  };

  // Send attachment
  const sendAttachment = async (asset, messageType) => {
    try {
      setIsUploading(true);

      // Send message with attachment directly
      await sendMessageWithAttachment(
        asset.uri,
        asset.fileName,
        asset.type,
        messageType,
      );
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        'Failed to send the file. Please try again.',
      );
      console.error('Send attachment error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Show attachment modal
  const showAttachmentModalWithAnimation = () => {
    setShowAttachmentModal(true);
    Animated.spring(attachmentModalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideAttachmentModal = () => {
    Animated.spring(attachmentModalAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowAttachmentModal(false);
    });
  };

  useEffect(() => {
    const setupSocket = async () => {
      const token = await getDataFromStore('token');
      setCurrentUserId(user?._id);

      socket.emit('joinRoom', {chatRoomId: roomId});

      // Fetch existing messages
      const response = await axios.get(
        `${BASE_URL}/chat/rooms/${roomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages(response?.data?.messages);
      console.log('messages',response?.data?.messages);

      socket.on('newMessage', newMessage => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        flatListRef.current?.scrollToOffset({offset: 0, animated: true});
      });

      socket.on('messageEdited', editedMessage => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === editedMessage._id ? editedMessage : msg,
          ),
        );
      });

      socket.on('messageDeleted', ({messageId}) => {
        setMessages(prevMessages =>
          prevMessages.filter(msg => msg._id !== messageId),
        );
      });

      socket.on('error', error => {
        Alert.alert('Error', error.message);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('error');
        socket.emit('leaveRoom', {chatRoomId: roomId});
      };
    };

    setupSocket();
  }, [roomId]);

  useEffect(() => {
    socket.on('userOnline', ({userId}) => {
      if (userId === receiverUserId) {
        setReceiverInfo(prev => ({...prev, isOnline: true}));
      }
    });

    socket.on('userOffline', ({userId}) => {
      if (userId === receiverUserId) {
        setReceiverInfo(prev => ({
          ...prev,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        }));
      }
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [receiverUserId]);

  const showActionModalWithAnimation = () => {
    setShowActionModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideActionModalWithAnimation = () => {
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowActionModal(false);
      setSelectedMessage(null);
    });
  };

  const handleMessageLongPress = message => {
    if (message.sender._id === currentUserId) {
      setSelectedMessage(message);
      showActionModalWithAnimation();
    }
  };

  const handleEditMessage = () => {
    setIsEditing(true);
    setEditingMessage(selectedMessage);
    setCurrentMessage(selectedMessage.content);
    hideActionModalWithAnimation();
  };

  const handleDeleteMessage = () => {
    hideActionModalWithAnimation();

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            socket.emit('deleteMessage', {
              messageId: selectedMessage._id,
            });
          },
        },
      ],
    );
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingMessage(null);
    setCurrentMessage('');
  };

  const handleEmojiSelect = emoji => {
    setCurrentMessage(prev => prev + emoji);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    if (editingMessage) {
      console.log('editmessage', editingMessage);
      // Edit existing message
      socket.emit('editMessage', {
        messageId: editingMessage?._id,
        content: currentMessage.trim(),
      });

      setIsEditing(false);
      setEditingMessage(null);
    } else {
      // Send new message
      const messageData = {
        content: currentMessage.trim(),
        chatRoomId: roomId,
        messageType: 'text',
        tempId: Date.now(),
      };

      socket.emit('sendMessage', messageData);
    }

    setCurrentMessage('');
    setShowEmojiPicker(false); // Hide emoji picker after sending
  };

  const renderMessage = ({item}) => {
    const isCurrentUser = item.sender._id === currentUserId;

    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={0.7}
        key={item._id}>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.myMessage : styles.theirMessage,
          ]}>
          {/* Render attachment if present */}
          {item.messageType === 'image' && item?.fileUrl && (
            <>
            {/* {console.log('here')} */}
            <Image
              // source={{
              //   uri: item.fileUrl.startsWith('http')
              //     ? item.fileUrl
              //     : `${BACKEND_URL}/${item?.fileUrl?.replace(/\\/g, '/')}`,
              // }}
              source={{
                uri: `${receiverInfo?.profile}`,
              }}
              style={styles.attachmentImage}
              resizeMode="cover"
              onError={error => console.log('Image load error:', error)}
              onLoad={() => console.log('Image loaded successfully')}
            />
            </>
          )}

          {item.messageType === 'video' && item.fileUrl && (
            <View style={styles.videoContainer}>
              <Image
                source={{
                  uri: `${item?.fileUrl}`,
                }}
                style={styles.attachmentImage}
                resizeMode="cover"
                onError={error => console.log('Video thumbnail error:', error)}
              />
              <View style={styles.videoOverlay}>
                <MaterialIcons
                  name="play-circle-fill"
                  size={40}
                  color="white"
                />
              </View>
            </View>
          )}

          {/* Render text content */}
          {item.content && item.messageType === 'text' && (
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.myMessageText : styles.theirMessageText,
              ]}>
              {item.content}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isCurrentUser ? styles.myMessageTime : styles.theirMessageTime,
              ]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.edited && (
              <Text
                style={[
                  styles.editedText,
                  isCurrentUser ? styles.myEditedText : styles.theirEditedText,
                ]}>
                edited
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ActionModal = () => (
    <Modal
      transparent={true}
      visible={showActionModal}
      animationType="none"
      onRequestClose={hideActionModalWithAnimation}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={hideActionModalWithAnimation}>
        <Animated.View
          style={[
            styles.actionModal,
            {
              transform: [
                {
                  scale: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: modalAnimation,
            },
          ]}>
          <Text style={styles.modalTitle}>Message Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditMessage}>
            <MaterialIcons name="edit" size={20} color="#D4ACFB" />
            <Text style={styles.actionButtonText}>Edit Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteMessage}>
            <MaterialIcons name="delete" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete Message
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={hideActionModalWithAnimation}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const AttachmentModal = () => (
    <Modal
      transparent={true}
      visible={showAttachmentModal}
      animationType="none"
      onRequestClose={hideAttachmentModal}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={hideAttachmentModal}>
        <Animated.View
          style={[
            styles.attachmentModal,
            {
              transform: [
                {
                  scale: attachmentModalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: attachmentModalAnimation,
            },
          ]}>
          <Text style={styles.modalTitle}>Select Attachment</Text>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => handleAttachmentSelect('camera')}>
            <MaterialIcons name="camera-alt" size={24} color="#D4ACFB" />
            <Text style={styles.attachmentButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => handleAttachmentSelect('gallery')}>
            <MaterialIcons name="photo-library" size={24} color="#D4ACFB" />
            <Text style={styles.attachmentButtonText}>Photo Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => handleAttachmentSelect('video')}>
            <MaterialIcons name="videocam" size={24} color="#D4ACFB" />
            <Text style={styles.attachmentButtonText}>Video Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={hideAttachmentModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{
            uri: `${receiverInfo?.profile}`,
          }}
        />
        <View style={{flex: 1}}>
          <Text style={styles.name}>{receiverInfo?.name}</Text>
          <Text style={{color: 'gray', fontSize: 10}}>
            {formatLastSeen(receiverInfo)}
          </Text>
        </View>
        <Icon name="dots-three-horizontal" size={20} style={styles.icon} />
      </View>

      {/* Messages */}
      <FlatList
        data={[...messages].reverse()}
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{paddingVertical: 10}}
        style={{flex: 1}}
        inverted
        ref={flatListRef}
      />

      {/* Editing indicator */}
      {isEditing && (
        <View style={styles.editingIndicator}>
          <MaterialIcons name="edit" size={16} color="#D4ACFB" />
          <Text style={styles.editingText}>Editing message</Text>
          <TouchableOpacity
            onPress={cancelEdit}
            style={styles.cancelEditButton}>
            <MaterialIcons name="close" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Upload indicator */}
      {isUploading && (
        <View style={styles.uploadIndicator}>
          <MaterialIcons name="cloud-upload" size={16} color="#D4ACFB" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <CustomEmojiPicker
          onEmojiSelected={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(prev => !prev)}
          style={styles.emojiButton}>
          <Text style={styles.emojiButtonText}>😊</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={isEditing ? 'Edit your message' : 'Type Your Message'}
          placeholderTextColor="#8C8C8C"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          underlineColorAndroid="transparent"
          multiline
        />

        {/* <TouchableOpacity
          onPress={showAttachmentModalWithAnimation}
          style={styles.attachmentIconButton}
          disabled={isUploading}>
          <MaterialIcons
            name="attach-file"
            size={24}
            color={isUploading ? '#ccc' : '#D4ACFB'}
          />
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={isUploading}>
          <Text style={styles.sendButtonText}>
            <FontAwesome name={isEditing ? 'check' : 'send'} />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Modal */}
      <ActionModal />

      {/* Attachment Modal */}
      <AttachmentModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 15,
  },
  icon: {
    color: '#94A3B8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emojiButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 20,
  },
  name: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 3,
  },
  myMessage: {
    backgroundColor: '#D4ACFB',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: '#0F172A',
  },
  theirMessageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  myMessageTime: {
    color: '#0F172A',
    opacity: 0.7,
  },
  theirMessageTime: {
    color: 'white',
    opacity: 0.7,
  },
  editedText: {
    fontSize: 9,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  myEditedText: {
    color: '#0F172A',
    opacity: 0.6,
  },
  theirEditedText: {
    color: 'white',
    opacity: 0.6,
  },
  editingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editingText: {
    color: '#D4ACFB',
    marginLeft: 6,
    flex: 1,
    fontSize: 12,
  },
  cancelEditButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    // backgroundColor: 'red',
    margin: 4,
  },
  sendButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 4,
  },
  sendButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#334155',
  },
  deleteButton: {
    backgroundColor: '#3F1F1F',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#475569',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  emojiPickerContainer: {
    position: 'absolute',
    bottom: 70, 
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
  },

  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  emojiPickerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#334155',
  },

  categoryTabs: {
    maxHeight: 50,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },

  selectedCategoryTab: {
    backgroundColor: '#D4ACFB',
  },

  categoryTabText: {
    fontSize: 20,
    opacity: 0.7,
  },

  selectedCategoryTabText: {
    opacity: 1,
  },

  emojiGrid: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },

  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },

  emojiItem: {
    width: (width - 48) / 8, // 8 emojis per row with padding
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  emojiText: {
    fontSize: 24,
  },

  emojiButtonText: {
    fontSize: 20,
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiItemPressed: {
    backgroundColor: '#334155',
    transform: [{scale: 1.1}],
  },

  attachmentIconButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  uploadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4ACFB',
  },

  uploadingText: {
    color: '#D4ACFB',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },

  attachmentModal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#334155',
  },

  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },

  attachmentButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },

  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },

  videoContainer: {
    position: 'relative',
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 4, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
});
