import React, { Component, createRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
} from "react-native";

// You should create Constants file Having an export PADDINGS and SIZES objects.
import { PADDINGS, SIZES } from "../constants/Constants";

// You should create Theme file Having an export defaultTheme object.
import { defaultTheme } from "../constants/Theme";

const { width, height } = Dimensions.get("screen");

class IntroSliderScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slides: [
        {
          slide_id: "1",
          slide_image:
            "https://www.saidaonline.com/new/uploads/news/1200x630/21/07/mcdonaldsglobal.jpg",
          slide_title: "أشهى المأكولات في مكان واحد",
          slide_description:
            "اطلب كل الأكلات المفضلة لديك. التوصيل فى أسرع وقت",
        },
        {
          slide_id: "2",
          slide_image:
            "https://d.newsweek.com/en/full/1919624/fast-food-stock-photo.jpg",
          slide_title: "خدمة ممتازة وجودة عالية",
          slide_description:
            "مأكولات طازجة وذات جودة عالية. خدمات رائعة ومتميزة",
        },
        {
          slide_id: "3",
          slide_image:
            "https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/fast-food.jpg",
          slide_title: "أقربلك..... أوفرلك.....",
          slide_description:
            "يوجد لدينا 5 فروع فى أماكن مختلفة. أسعارنا متميزة",
        },
      ],
      isLastSlide: false,
      viewableIndex: 0,
      imageUri:
        "https://www.saidaonline.com/new/uploads/news/1200x630/21/07/mcdonaldsglobal.jpg",
    };

    this.scrollX = new Animated.Value(0);
    this.flatListRef = createRef();
  }

  keyExtractor = (item, index) => index.toString();

  // Dots implementation
  Indicator = (scrollX) => {
    return (
      <View style={styles.dotsContainer}>
        {this.state.slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.5, 1],
            extrapolate: "clamp",
            useNativeDriver: true,
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
            useNativeDriver: true,
          });
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                  backgroundColor: defaultTheme.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Images implementation
  Images = (scrollX) => {
    const index = this.state.viewableIndex;

    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(scrollX, width),
        new Animated.Value(width)
      ),
      1
    );

    const rotate = YOLO.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: ["0deg", "90deg", "180deg", "270deg", "360deg"],
      extrapolate: "clamp",
      useNativeDriver: true,
    });

    return (
      <View style={styles.imagesContainer}>
        <Animated.View
          style={{
            ...styles.animationView,
            transform: [{ rotate }],
            borderColor: defaultTheme.border,
          }}
        >
          <Animated.Image
            source={{
              uri: this.state.imageUri,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    );
  };

  onViewableItemsChanged = ({ viewableItems, changed }) => {
    this.setState({
      isLastSlide: viewableItems[0].index == 2 ? true : false,
      viewableIndex: viewableItems[0].index,
      imageUri: viewableItems[0].item.slide_image,
    });
  };

  render() {
    const { slides, isLastSlide, viewableIndex, imageUri } = this.state;

    return (
      <View style={[styles.body, { backgroundColor: defaultTheme.background }]}>
        {this.Images(this.scrollX)}
        <Animated.FlatList
          ref={this.flatListRef}
          data={slides}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
          renderItem={({ item, index }) => {
            return (
              <View style={styles.slideContainer}>
                <Text
                  style={[styles.titleSlideText, { color: defaultTheme.text2 }]}
                >
                  {item.slide_title}
                </Text>
                <Text
                  style={[
                    styles.descriptionSlideText,
                    { color: defaultTheme.gray },
                  ]}
                >
                  {item.slide_description}
                </Text>
              </View>
            );
          }}
          keyExtractor={this.keyExtractor}
          horizontal
          pagingEnabled
        />

        {this.Indicator(this.scrollX)}

        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.3}
            style={[styles.button, { backgroundColor: defaultTheme.primary }]}
            onPress={async () => {
              if (viewableIndex == 2) {
                this.props.navigation.replace("AuthStack");
                await AsyncStorage.setItem("switch", "Auth");
              } else {
                this.flatListRef.current.scrollToIndex({
                  animated: true,
                  index: viewableIndex + 1,
                });
              }
            }}
          >
            <Text style={[styles.btnText, { color: defaultTheme.background }]}>
              {isLastSlide ? "ابدأ" : "التالى"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: height * 0.04 }} />

        <TouchableOpacity
          activeOpacity={0.3}
          disabled={viewableIndex == 2 ? true : false}
          style={[styles.skipBtn, { backgroundColor: defaultTheme.background }]}
          onPress={() =>
            this.flatListRef.current.scrollToEnd({ animated: true })
          }
        >
          <Text
            style={[
              styles.skipText,
              {
                color:
                  viewableIndex == 2 ? defaultTheme.gray : defaultTheme.primary,
              },
            ]}
          >
            تخطى
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  slideSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContainer: {
    flex: 1,
    width: width,
    paddingHorizontal: width * 0.15,
    // backgroundColor: '#f0f',
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    flexDirection: "row-reverse",
    alignSelf: "center",
    // backgroundColor: 'red',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    margin: 5,
  },
  bottomSection: {
    width,
    height: height * 0.15,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: width * 0.5,
    height: height * 0.07,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    elevation: 3,
  },
  btnText: {
    fontSize: SIZES.mediumFontSize,
    fontFamily: "Tajawal",
  },
  imagesContainer: {
    width,
    height: height * 0.4,
    alignItems: "center",
    justifyContent: "flex-end",
    // backgroundColor: '#f00',
  },
  imageView: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: (width * 0.7) / 2,
    borderWidth: 1,
  },
  skipBtn: {
    paddingHorizontal: PADDINGS.smallPadding,
    paddingVertical: PADDINGS.smallPadding / 2,
    position: "absolute",
    top: PADDINGS.padding,
    left: PADDINGS.padding,
    // elevation: 1,
  },
  skipText: {
    fontSize: SIZES.smallFontSize,
    fontFamily: "Tajawal",
  },
  animationView: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 1,
    // elevation: 3,
  },
  image: {
    flex: 1,
    borderRadius: (width * 0.7) / 2,
  },
  titleSlideText: {
    fontSize: SIZES.largeFontSize,
    textAlign: "center",
    marginBottom: PADDINGS.padding,
    fontFamily: "Tajawal",
  },
  descriptionSlideText: {
    fontSize: SIZES.smallFontSize,
    textAlign: "center",
    fontFamily: "Tajawal",
  },
});

export default IntroSliderScreen;
