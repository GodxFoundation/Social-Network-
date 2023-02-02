import React, { useState, useRef, useEffect } from 'react'
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from 'react-native-actionsheet'
import { Video } from 'expo-av'
import { Camera } from 'expo-camera'
import { useTheme, useTranslations } from 'dopenative'
import FastImage from 'react-native-fast-image'
import { createImageProgress } from 'react-native-image-progress'
import { extractSourceFromFile } from '../../../Core/helpers/retrieveSource'
import { TNStoryItem, TNTouchableIcon } from '../../../Core/truly-native'
import IMLocationSelectorModal from '../../../Core/location/IMLocationSelectorModal/IMLocationSelectorModal'
import { IMRichTextInput, IMMentionList, EU } from '../../../Core/mentions'
import IMCameraModal from '../../../Core/camera/IMCameraModal'
import dynamicStyles from './styles'
import { useConfig } from '../../../config'

const Image = createImageProgress(FastImage)

function CreatePost(props) {
  const {
    onPostDidChange,
    onSetMedia,
    onLocationDidChange,
    user,
    inputRef,
    blurInput,
    friends,
  } = props
  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const config = useConfig()

  const [address, setAddress] = useState('')
  const [locationSelectorVisible, setLocationSelectorVisible] = useState(false)
  const [media, setMedia] = useState([])
  const [mediaSources, setMediaSources] = useState([])
  const [isCameralContainer, setIsCameralContainer] = useState(true)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [showUsersMention, setShowUsersMention] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [isTrackingStarted, setIsTrackingStarted] = useState(false)
  const [friendshipData, setFriendshipData] = useState([])
  const photoUploadDialogRef = useRef()
  const removePhotoDialogRef = useRef()
  const editorRef = useRef()

  const androidAddPhotoOptions = [
    localized('Import from Library'),
    localized('Take Photo'),
    localized('Record Video'),
    localized('Cancel'),
  ]

  const iosAddPhotoOptions = [
    localized('Import from Library'),
    localized('Open Camera'),
    localized('Cancel'),
  ]

  const addPhotoCancelButtonIndex = {
    ios: 2,
    android: 3,
  }

  const addPhotoOptions =
    Platform.OS === 'android' ? androidAddPhotoOptions : iosAddPhotoOptions

  useEffect(() => {
    if (!friends) {
      return
    }
    const formattedFriends = friends.map(friend => {
      const name = `${friend.firstName} ${friend.lastName}`
      const username = `${friend.firstName}.${friend.lastName}`
      const id = friend.id || friend.userID

      return { id, name, username, ...friend }
    })
    setFriendshipData(formattedFriends)
  }, [friends])

  const onLocationSelectorPress = () => {
    setLocationSelectorVisible(!locationSelectorVisible)
  }

  const onLocationSelectorDone = address => {
    setLocationSelectorVisible(!locationSelectorVisible)
    setAddress(address)
  }

  const onChangeLocation = address => {
    setAddress(address)
    onLocationDidChange(address)
  }

  const onChangeText = ({ displayText, text }) => {
    const mentions = EU.findMentions(text)
    const post = {
      postText: text,
      mentions,
    }
    onPostDidChange(post)
  }

  const runIfCameraPermissionGranted = async callback => {
    const { status } = await Camera.requestPermissionsAsync()

    if (status === 'granted') {
      callback && callback()
    } else {
      Alert.alert(
        localized('Camera permission denied'),
        localized(
          'You must enable camera permissions in order to take photos.',
        ),
      )
    }
  }

  const onCameraIconPress = () => {
    runIfCameraPermissionGranted(() => {
      if (Platform.OS === 'ios') {
        setIsCameraOpen(true)
      } else {
        photoUploadDialogRef.current.show()
      }
    })
  }

  const onPhotoUploadDialogDoneIOS = index => {
    if (index == 1) {
      onLaunchCamera()
    }

    if (index == 0) {
      onOpenPhotos()
    }
  }

  const onPhotoUploadDialogDoneAndroid = index => {
    if (index == 2) {
      onLaunchVideoCamera()
    }

    if (index == 1) {
      onLaunchCamera()
    }

    if (index == 0) {
      onOpenPhotos()
    }
  }

  const onPhotoUploadDialogDone = index => {
    const onPhotoUploadDialogDoneSetter = {
      ios: () => onPhotoUploadDialogDoneIOS(index),
      android: () => onPhotoUploadDialogDoneAndroid(index),
    }

    onPhotoUploadDialogDoneSetter[Platform.OS]()
  }

  const onLaunchCamera = () => {
    ImagePicker.openCamera({
      cropping: false,
      compressImageMaxHeight: 1100,
      compressImageMaxWidth: 1100,
    }).then(image => {
      handleMediaFile(image)
    })
  }

  const onLaunchVideoCamera = () => {
    ImagePicker.openCamera({
      cropping: false,
      mediaType: 'video',
    }).then(image => {
      handleMediaFile(image)
    })
  }

  const onOpenPhotos = () => {
    ImagePicker.openPicker({
      cropping: false,
      multiple: false,
    }).then(image => {
      handleMediaFile(image)
    })
  }

  const onRemovePhotoDialogDone = index => {
    if (index === 0) {
      removePhoto()
    } else {
      setSelectedIndex(null)
    }
  }

  const onMediaPress = async index => {
    await setSelectedIndex(index)
    removePhotoDialogRef.current.show()
  }

  const onCameraClose = () => {
    setIsCameraOpen(false)
  }

  const onImagePost = item => {
    handleMediaFile(item)
  }

  const handleMediaFile = mediaFile => {
    setIsCameraOpen(false)

    const { source, mime, filename, uri } = extractSourceFromFile(mediaFile)

    setMedia([...media, { source, mime }])
    setMediaSources([...mediaSources, { filename, uri, mime }])
    onSetMedia([...mediaSources, mediaFile])
  }

  const removePhoto = async () => {
    const slicedMedia = [...media]
    const slicedMediaSources = [...mediaSources]
    await slicedMedia.splice(selectedIndex, 1)
    await slicedMediaSources.splice(selectedIndex, 1)
    setMedia([...slicedMedia])
    setMediaSources([...slicedMediaSources])
    onSetMedia([...slicedMediaSources])
  }

  const onTextFocus = () => {
    // setIsCameralContainer(false);
  }

  const onToggleImagesContainer = () => {
    // blurInput();
    toggleImagesContainer()
  }

  const toggleImagesContainer = () => {
    setIsCameralContainer(!isCameralContainer)
  }

  const onStoryItemPress = item => {
    console.log('')
  }

  const editorStyles = {
    input: {
      color: theme.colors[appearance].primaryText,
    },
  }

  return (
    <KeyboardAvoidingView
      behavior={'height'}
      enabled={false}
      style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.headerContainer}>
          <TNStoryItem
            onPress={onStoryItemPress}
            item={user}
            imageContainerStyle={styles.userIconContainer}
            imageStyle={styles.userIcon}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{user.firstName}</Text>
            <Text style={styles.subtitle}>{address}</Text>
          </View>
        </View>
        <View style={styles.postInputContainer}>
          <IMRichTextInput
            richTextInputRef={editorRef}
            inputRef={inputRef}
            list={friendshipData}
            mentionListPosition={'bottom'}
            // initialValue={initialValue}
            // clearInput={this.state.clearInput}
            onChange={onChangeText}
            showEditor={true}
            toggleEditor={() => {}}
            editorStyles={editorStyles}
            showMentions={showUsersMention}
            onHideMentions={() => setShowUsersMention(false)}
            onUpdateSuggestions={setKeyword}
            onTrackingStateChange={setIsTrackingStarted}
          />
        </View>
      </View>
      <View style={[styles.bottomContainer]}>
        <View
          style={[
            styles.postImageAndLocationContainer,
            isTrackingStarted && { height: '100%' },
          ]}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={[
              styles.imagesContainer,
              isCameralContainer ? { display: 'flex' } : { display: 'none' },
            ]}>
            {media.map((singleMedia, index) => {
              const { source, mime } = singleMedia

              if (mime.startsWith('image')) {
                return (
                  <TouchableOpacity
                    key={source}
                    activeOpacity={0.9}
                    onPress={() => onMediaPress(index)}
                    style={styles.imageItemcontainer}>
                    <Image style={styles.imageItem} source={{ uri: source }} />
                  </TouchableOpacity>
                )
              } else {
                return (
                  <TouchableOpacity
                    key={source}
                    activeOpacity={0.9}
                    onPress={() => onMediaPress(index)}
                    style={styles.imageItemcontainer}>
                    <Video
                      source={{
                        uri: source,
                      }}
                      resizeMode={'cover'}
                      shouldPlay={false}
                      isMuted={true}
                      style={styles.imageItem}
                    />
                  </TouchableOpacity>
                )
              }
            })}
            <TouchableOpacity
              onPress={onCameraIconPress}
              style={[styles.imageItemcontainer, styles.imageBackground]}>
              <Image
                style={styles.addImageIcon}
                source={theme.icons.cameraFilled}
              />
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.addTitleAndlocationIconContainer}>
            <View style={styles.addTitleContainer}>
              <Text style={styles.addTitle}>
                {!isCameralContainer
                  ? localized('Add to your post')
                  : localized('Add photos to your post')}
              </Text>
            </View>
            <View style={styles.iconsContainer}>
              <TNTouchableIcon
                onPress={onToggleImagesContainer}
                containerStyle={styles.iconContainer}
                imageStyle={[
                  styles.icon,
                  isCameralContainer
                    ? styles.cameraFocusTintColor
                    : styles.cameraUnfocusTintColor,
                ]}
                iconSource={theme.icons.cameraFilled}
              />
              <TNTouchableIcon
                containerStyle={styles.iconContainer}
                imageStyle={[styles.icon, styles.pinpointTintColor]}
                iconSource={theme.icons.pinpoint}
                onPress={onLocationSelectorPress}
              />
            </View>
          </View>
          <IMMentionList
            list={friendshipData}
            keyword={keyword}
            isTrackingStarted={isTrackingStarted}
            onSuggestionTap={editorRef.current?.onSuggestionTap}
          />
        </View>
      </View>
      <View style={styles.blankBottom} />

      <IMLocationSelectorModal
        isVisible={locationSelectorVisible}
        onCancel={onLocationSelectorPress}
        onDone={onLocationSelectorDone}
        onChangeLocation={onChangeLocation}
      />
      <ActionSheet
        ref={photoUploadDialogRef}
        title={localized('Add photo')}
        options={addPhotoOptions}
        cancelButtonIndex={addPhotoCancelButtonIndex[Platform.OS]}
        onPress={onPhotoUploadDialogDone}
      />
      <ActionSheet
        ref={removePhotoDialogRef}
        title={localized('Remove photo')}
        options={[localized('Remove'), localized('Cancel')]}
        destructiveButtonIndex={0}
        cancelButtonIndex={1}
        onPress={onRemovePhotoDialogDone}
      />
      <IMCameraModal
        isCameraOpen={isCameraOpen}
        onImagePost={onImagePost}
        onCameraClose={onCameraClose}
        maxDuration={config.videoMaxDuration}
      />
    </KeyboardAvoidingView>
  )
}

export default CreatePost
