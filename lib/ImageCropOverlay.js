"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const horizontalSections = ['top', 'middle', 'bottom'];
const verticalSections = ['left', 'middle', 'right'];
function ImageCropOverlay(props) {
    const [selectedFrameSection, setSelectedFrameSection] = React.useState('middlemiddle');
    const [animatedCropSize] = React.useState({
        width: new react_native_1.Animated.Value(props.cropSize.width),
        height: new react_native_1.Animated.Value(props.cropSize.height)
    });
    const [panResponderEnabled, setPanResponderEnabled] = React.useState(false);
    const { imageBounds, fixedAspectRatio, lockAspectRatio, accumulatedPan, cropSize, minimumCropDimensions } = props;
    const pan = React.useRef(new react_native_1.Animated.ValueXY({
        x: imageBounds.x,
        y: imageBounds.y
    })).current;
    const panInstance = react_native_1.PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e, gestureState) => onOverlayMoveGrant(e, gestureState),
        onPanResponderMove: (e, gestureState) => onOverlayMove(e, gestureState),
        onPanResponderRelease: (e, gestureState) => onOverlayRelease(gestureState),
        onPanResponderTerminationRequest: () => false
    });
    const [panResponder, setPanResponder] = React.useState(panInstance);
    React.useEffect(() => {
        // https://stackoverflow.com/questions/61014169/react-natives-panresponder-has-stale-value-from-usestate
        setPanResponder(panInstance);
    }, [cropSize, accumulatedPan, selectedFrameSection]);
    React.useEffect(() => {
        // Reset the accumulated pan
        checkCropBounds({ dx: pan.x._value - accumulatedPan.x, dy: pan.y._value - accumulatedPan.y });
        // When the crop size updates make sure the animated value does too!
        animatedCropSize.height.setValue(cropSize.height);
        animatedCropSize.width.setValue(cropSize.width);
    }, [cropSize]);
    React.useEffect(() => {
        let newSize = { width: 0, height: 0 };
        const { width, height } = imageBounds;
        const imageAspectRatio = height / width;
        // Then check if the cropping aspect ratio is smaller
        if (fixedAspectRatio < imageAspectRatio) {
            // If so calculate the size so its not greater than the image width
            newSize.width = width;
            newSize.height = width * fixedAspectRatio;
        }
        else {
            // else, calculate the size so its not greater than the image height
            newSize.width = height / fixedAspectRatio;
            newSize.height = height;
        }
        // Set the size of the crop overlay
        props.onUpdateCropSize(newSize);
    }, [imageBounds]);
    const isMovingSection = () => {
        return (selectedFrameSection == 'topmiddle' ||
            selectedFrameSection == 'middleleft' ||
            selectedFrameSection == 'middleright' ||
            selectedFrameSection == 'middlemiddle' ||
            selectedFrameSection == 'bottommiddle');
    };
    const onOverlayMoveGrant = (e, gestureState) => {
        // TODO - Check if the action is to move or resize based on the
        // selected frame section
        if (isMovingSection()) {
            pan.setOffset({
                x: accumulatedPan.x,
                y: accumulatedPan.y
            });
        }
        else {
            // Do nothing
        }
    };
    const onOverlayMove = (e, gestureState) => {
        // TODO - Check if the action is to move or resize based on the
        // selected frame section
        if (isMovingSection()) {
            react_native_1.Animated.event([
                null,
                { dx: pan.x, dy: pan.y }
            ])(e, gestureState);
        }
        else {
            // Else its a scaling operation
            const { dx, dy } = gestureState;
            // Get the new target height / width
            let newWidth = cropSize.width;
            let newHeight = cropSize.height;
            // Check what resizing / translation needs to be performed based on which section was pressed
            if (selectedFrameSection == 'bottomright') {
                if (dx < dy) {
                    newWidth += dx;
                    lockAspectRatio ? newHeight = newWidth * fixedAspectRatio : newHeight += dy;
                }
                else {
                    newHeight += dy;
                    lockAspectRatio ? newWidth = newHeight / fixedAspectRatio : newWidth += dx;
                }
            }
            else if (selectedFrameSection == 'topright') {
                if (dx < dy) {
                    newWidth += dx;
                    lockAspectRatio ? newHeight = newWidth * fixedAspectRatio : newHeight -= dy;
                }
                else {
                    newHeight -= dy;
                    lockAspectRatio ? newWidth = newHeight / fixedAspectRatio : newWidth += dx;
                }
                pan.y.setValue(accumulatedPan.y + (cropSize.height - newHeight));
            }
            else if (selectedFrameSection == 'bottomleft') {
                if (dx < dy) {
                    newWidth -= dx;
                    lockAspectRatio ? newHeight = newWidth * fixedAspectRatio : newHeight += dy;
                }
                else {
                    newHeight += dy;
                    lockAspectRatio ? newWidth = newHeight / fixedAspectRatio : newWidth -= dx;
                }
                pan.x.setValue(accumulatedPan.x + (cropSize.width - newWidth));
            }
            else if (selectedFrameSection == 'topleft') {
                if (dx < dy) {
                    newWidth -= dx;
                    lockAspectRatio ? newHeight = newWidth * fixedAspectRatio : newHeight -= dy;
                }
                else {
                    newHeight -= dy;
                    lockAspectRatio ? newWidth = newHeight / fixedAspectRatio : newWidth -= dx;
                }
                pan.x.setValue(accumulatedPan.x + (cropSize.width - newWidth));
                pan.y.setValue(accumulatedPan.y + (cropSize.height - newHeight));
            }
            // Finally set the new height and width ready for checking if valid in onRelease
            animatedCropSize.width.setValue(newWidth);
            animatedCropSize.height.setValue(newHeight);
        }
    };
    const onOverlayRelease = (gestureState) => {
        // TODO - Check if the action is to move or resize based on the
        // selected frame section
        if (isMovingSection()) {
            // Flatten the offset to reduce erratic behaviour
            pan.flattenOffset();
            // Ensure the cropping overlay has not been moved outside of the allowed bounds
            checkCropBounds(gestureState);
        }
        else {
            // Else its a scaling op
            checkResizeBounds(gestureState);
            //
        }
        // Disable the pan responder so the section tile can be pressed
        setPanResponderEnabled(false);
    };
    const checkCropBounds = ({ dx, dy }) => {
        // Check if the pan in the x direction exceeds the bounds
        let accDx = accumulatedPan.x + dx;
        // Is the new x pos less than zero?
        if (accDx <= imageBounds.x) {
            // Then set it to be zero and set the pan to zero too
            accDx = imageBounds.x;
            pan.x.setValue(imageBounds.x);
        }
        // Is the new x pos plus crop width going to exceed the right hand bound
        else if ((accDx + cropSize.width) > (imageBounds.width + imageBounds.x)) {
            // Then set the x pos so the crop frame touches the right hand edge
            let limitedXPos = imageBounds.x + imageBounds.width - cropSize.width;
            accDx = limitedXPos;
            pan.x.setValue(limitedXPos);
        }
        else {
            // It's somewhere in between - no formatting required
        }
        // Check if the pan in the y direction exceeds the bounds
        let accDy = accumulatedPan.y + dy;
        // Is the new y pos less the top edge?
        if (accDy <= imageBounds.y) {
            // Then set it to be zero and set the pan to zero too
            accDy = imageBounds.y;
            pan.y.setValue(imageBounds.y);
        }
        // Is the new y pos plus crop height going to exceed the bottom bound
        else if ((accDy + cropSize.height) > (imageBounds.height + imageBounds.y)) {
            // Then set the y pos so the crop frame touches the bottom edge
            let limitedYPos = imageBounds.y + imageBounds.height - cropSize.height;
            accDy = limitedYPos;
            pan.y.setValue(limitedYPos);
        }
        else {
            // It's somewhere in between - no formatting required
        }
        // Record the accumulated pan
        props.onUpdateAccumulatedPan({ x: accDx, y: accDy });
    };
    const checkResizeBounds = ({ dx, dy }) => {
        const { width: maxWidth, height: maxHeight } = imageBounds;
        const { width: minWidth, height: minHeight } = minimumCropDimensions;
        const animatedWidth = animatedCropSize.width._value;
        const animatedHeight = animatedCropSize.height._value;
        const finalSize = {
            width: animatedWidth,
            height: animatedHeight
        };
        // Ensure the width / height does not exceed the boundaries - 
        // resize to the max it can be if so
        if (animatedHeight > maxHeight) {
            finalSize.height = maxHeight;
            finalSize.width = lockAspectRatio ? finalSize.height / fixedAspectRatio : finalSize.width;
        }
        else if (animatedHeight < minHeight) {
            finalSize.height = minHeight;
            finalSize.width = lockAspectRatio ? finalSize.height / fixedAspectRatio : finalSize.width;
        }
        if (animatedWidth > maxWidth) {
            finalSize.width = maxWidth;
            finalSize.height = lockAspectRatio ? finalSize.width * fixedAspectRatio : finalSize.height;
        }
        else if (animatedWidth < minWidth) {
            finalSize.width = minWidth;
            finalSize.height = lockAspectRatio ? finalSize.width * fixedAspectRatio : finalSize.height;
        }
        // Update together else one gets replaced with stale state
        props.onUpdatePanAndSize({
            size: finalSize,
            accumulatedPan: {
                x: pan.x._value,
                y: pan.y._value
            }
        });
    };
    const panProps = panResponderEnabled ? Object.assign({}, panResponder.panHandlers) : {};
    return (<react_native_1.View style={styles.container} {...panProps}>
      
      <react_native_1.TouchableWithoutFeedback onPress={() => { }} disabled>
        <react_native_1.Animated.View style={[
        styles.overlay,
        animatedCropSize,
        { transform: [
                { translateX: pan.x },
                { translateY: pan.y }
            ] }
    ]}>
            {
    // For reendering out each section of the crop overlay frame
    horizontalSections.map((hsection) => {
        return (<react_native_1.View style={styles.sectionRow} key={hsection}>
                    {verticalSections.map((vsection) => {
            const key = hsection + vsection;
            return (<react_native_1.TouchableOpacity style={[
                styles.defaultSection
            ]} key={key} onPressIn={() => __awaiter(this, void 0, void 0, function* () {
                setSelectedFrameSection(key);
                // No good way to asynchronously enable the pan responder
                // after tile selection so using a timeout for now...
                setTimeout(() => {
                    setPanResponderEnabled(true);
                }, 30);
            })} activeOpacity={1.0}>
                            {
            // Add the corner markers to the topleft, 
            // topright, bottomleft and bottomright corners to indicate resizing
            key == 'topleft' ||
                key == 'topright' ||
                key == 'bottomleft' ||
                key == 'bottomright' ?
                <react_native_1.View style={[
                    styles.cornerMarker,
                    hsection == 'top' ?
                        { top: -4, borderTopWidth: 7 }
                        :
                            { bottom: -4, borderBottomWidth: 7 },
                    vsection == 'left' ?
                        { left: -4, borderLeftWidth: 7 }
                        :
                            { right: -4, borderRightWidth: 7 },
                ]}/>
                : null}
                          </react_native_1.TouchableOpacity>);
        })}
                  </react_native_1.View>);
    })}
        </react_native_1.Animated.View>
      </react_native_1.TouchableWithoutFeedback>
    </react_native_1.View>);
}
exports.ImageCropOverlay = ImageCropOverlay;
const styles = react_native_1.StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        position: 'absolute'
    },
    overlay: {
        height: 40,
        width: 40,
        backgroundColor: '#33333355',
        borderColor: '#ffffff88',
        borderWidth: 1
    },
    sectionRow: {
        flexDirection: 'row',
        flex: 1
    },
    defaultSection: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#ffffff88',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cornerMarker: {
        position: 'absolute',
        borderColor: '#ffffff',
        height: 30,
        width: 30
    }
});
//# sourceMappingURL=ImageCropOverlay.js.map