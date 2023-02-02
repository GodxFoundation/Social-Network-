import React, { useRef, useState, useEffect, memo } from 'react'
import { TouchableOpacity, Platform, NativeModules } from 'react-native'
import { useSelector } from 'react-redux'
import { createImageProgress } from 'react-native-image-progress'
import { useTheme } from 'dopenative'
import FastImage from 'react-native-fast-image'
import { Video } from 'expo-av'
import convertToProxyURL from 'react-native-video-cache'
import { TNTouchableIcon } from '../../Core/truly-native'
import dynamicStyles from './styles'
import { useCurrentUser } from '../../Core/onboarding'

const Image = createImageProgress(FastImage)

const { VideoPlayerManager } = NativeModules

const FeedMedia = memo(
  ({
    media,
    index,
    item,
    onImagePress,
    postMediaIndex,
    inViewPort,
    willBlur,
    showVideo = true,
    playVideoOnLoad,
  }) => {
    if (!item.postMedia || !item.postMedia.length) {
      alert('There is no post media to display. You must fix this error.')
      return null
    }

    const currentUser = useCurrentUser()

    const { theme, appearance } = useTheme()
    const styles = dynamicStyles(theme, appearance)

    const [videoLoading, setVideoLoading] = useState(true)
    const [isVideoMuted, setIsVideoMuted] = useState(true)
    const [playEnabledFromSettings, setPlayEnabledFromSettings] = useState(true)
    const videoRef = useRef()

    const isVideo = media?.mime?.includes('video')

    // autoplay_video_enabled
    // mute_video_enabled

    const settingsHandler = {
      autoplay_video_enabled: playValue =>
        setPlayEnabledFromSettings(playValue),
      mute_video_enabled: muteValue => setIsVideoMuted(muteValue),
    }

    useEffect(() => {
      const appSettings = currentUser.settings
      if (appSettings) {
        const settingsKeys = Object.keys(appSettings)
        if (settingsKeys.length > 0) {
          settingsKeys.forEach(
            key =>
              settingsHandler[key] && settingsHandler[key](appSettings[key]),
          )
        }
      }
    }, [currentUser])

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current?.setIsMutedAsync(isVideoMuted)
      }
    }, [isVideoMuted])

    useEffect(() => {
      const handleIsPostMediaIndex = async () => {
        if (playVideoOnLoad) {
          return
        }
        if (postMediaIndex === index && inViewPort && playEnabledFromSettings) {
          if (videoRef.current) {
            await videoRef.current?.replayAsync()
          }
        } else {
          if (videoRef.current) {
            await videoRef.current?.pauseAsync(true)
          }
        }
      }

      handleIsPostMediaIndex()
    }, [postMediaIndex])

    useEffect(() => {
      handleInViewPort()
    }, [inViewPort])

    useEffect(() => {
      const handleVideoStatus = async () => {
        if (videoRef.current) {
          const videoStatus = await videoRef.current?.getStatusAsync()
          if (videoStatus.isPlaying) {
            videoRef.current?.pauseAsync(true)
          }
        }
      }

      handleVideoStatus()
    }, [willBlur])

    const handleInViewPort = async () => {
      const postMedia = item.postMedia

      if (
        !playVideoOnLoad &&
        postMediaIndex === index &&
        postMedia[postMediaIndex] &&
        isVideo &&
        playEnabledFromSettings
      ) {
        if (inViewPort) {
          if (videoRef.current) {
            const videoStatus = await videoRef.current.getStatusAsync()
            !videoStatus.isPlaying && (await videoRef.current.replayAsync())
          }
        } else {
          if (videoRef.current) {
            await videoRef.current.pauseAsync(true)
          }
        }
      }
    }

    const onVideoLoadStart = () => {
      setVideoLoading(true)
    }

    const onVideoLoad = () => {
      setVideoLoading(false)
      if (playVideoOnLoad) {
        videoRef.current?.playAsync(true)
        return
      }
      handleInViewPort()
    }

    const onSoundPress = () => {
      setIsVideoMuted(prevIsVideoMuted => !prevIsVideoMuted)
    }

    const onVideoMediaPress = url => {
      if (Platform.OS === 'android') {
        VideoPlayerManager.showVideoPlayer(url)
      } else {
        if (videoRef.current) {
          videoRef.current.presentFullscreenPlayer()
        }
      }
    }

    const onImageMediaPress = () => {
      const filteredImages = []
      item.postMedia.forEach(singleMedia => {
        if (
          singleMedia.mime &&
          singleMedia.mime?.startsWith('image') &&
          singleMedia.url
        ) {
          filteredImages.push(singleMedia.url)
        }

        if (singleMedia && !singleMedia.mime) {
          filteredImages.push(singleMedia)
        }
      })

      onImagePress(filteredImages, index)
    }

    const onMediaFilePress = () => {
      if (isVideo) {
        onVideoMediaPress(media.url)
        return
      }
      onImageMediaPress()
    }

    const rendenderMediaFile = () => {
      if (showVideo && isVideo) {
        const url = media?.url || media
        const videoURL = typeof url === 'string' ? convertToProxyURL(url) : ''
        return (
          <Video
            ref={videoRef}
            source={
              playVideoOnLoad
                ? { uri: videoURL }
                : inViewPort
                ? { uri: videoURL }
                : undefined
            }
            posterSource={{ uri: media.thumbnailURL }}
            posterStyle={{ resizeMode: 'cover' }}
            onLoad={onVideoLoad}
            resizeMode={'cover'}
            onLoadStart={onVideoLoadStart}
            style={[styles.bodyImage]}
            usePoster={!!media.thumbnailURL}
          />
        )
      }

      if (media.thumbnailURL || media.url) {
        return (
          <Image
            source={{ uri: media.thumbnailURL || media.url }}
            style={styles.bodyImage}
          />
        )
      }
    }

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onMediaFilePress}>
        {rendenderMediaFile()}
        {isVideo && (
          <TNTouchableIcon
            onPress={onSoundPress}
            imageStyle={styles.soundIcon}
            containerStyle={styles.soundIconContainer}
            iconSource={
              isVideoMuted ? theme.icons.soundMute : theme.icons.sound
            }
          />
        )}
      </TouchableOpacity>
    )
  },
)

export default FeedMedia
