import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

export default function GetStartedBtn () {
    return (
        <>
        <View >
            <LinearGradient style={styles.btn} end={{x: 1, y: 0}} colors={["#0974F1","#9FCCFA",]} locations={[0,0.9]} >
                <Text style={styles.btnText}>Get Started</Text>
                <View style={styles.btnArrowContainer} >
                <Icon name="arrow-right" size={15} style={styles.btnArrow} />
                </View>
            </LinearGradient>
        </View>
        </>
    )

}



const styles = StyleSheet.create({
    btn:{
        // justifyContent: 'center',
        alignItems: 'center',
        width: 262,
        height: 43,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 35,
    },
    btnText:{
        color: 'white',
        fontWeight: 700,
        fontSize: 20
    },
    btnArrow:{
        marginTop: 5,
        fontWeight: 600,
        // fontSize: 15
    },
    btnArrowContainer: {
        borderRadius: 40,
        backgroundColor: 'white',
        paddingHorizontal: 5,
        paddingBottom: 5,

        // Shadow properties
        shadowColor: '#000',
        shadowOffset: { width: 7, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5, // For Android
    },
})
