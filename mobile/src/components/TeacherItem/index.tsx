import React, { useState } from 'react';
import { View, Image, Text, Linking } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';

import heartOutlineIcon from '../../assets/images/icons/heart-outline.png';
import unfavoriteIcon from '../../assets/images/icons/unfavorite.png';
import whatsappIcon from '../../assets/images/icons/whatsapp.png';

import styles from './styles';
import { preventAutoHideAsync } from 'expo/build/launch/SplashScreen';
import api from '../../services/api';

export interface Teacher {
    id: number;
    name: string;
    avatar: string;
    bio: string;
    whatsapp: string;
    subject: string;
    cost: number;
}

interface TeacherItemProps {
    teacher: Teacher;
    favorited: boolean;
}
const TeacherItem: React.FC<TeacherItemProps> = ({ teacher, favorited }) => {
    const [isFavorited, setIsFavorited] = useState(favorited);

    function handleLinkToWhatsapp() {
        api.post('connections', {
            user_id: teacher.id,
        })
        Linking.openURL(`whatsapp://send?phone=${teacher.whatsapp}`)

    }

    async function handleToggleFavorite() {
        const favorites = await AsyncStorage.getItem('favorites');

        let favoritesArray = [];

        if (favorites) {
            const favoritesArray = JSON.parse(favorites);
        }


        if (isFavorited) {
            // remover dos favoritos
            const favoriteIndex = favoritesArray.findIndex((teacherItem: Teacher) => {
                return teacherItem.id === teacher.id;

            });

            favoritesArray.splice(favoriteIndex, 1);

            setIsFavorited(false);

        } else {
            //add favoritos

            favoritesArray.push(teacher);
            setIsFavorited(true);
            
        }
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray))

    }
    return (
        <View style={styles.container}>
            <View style={styles.profile}>
                <Image style={styles.avatar}
                    source={{ uri: teacher.avatar }}
                />

                <View style={styles.profileInfo}>
                    <Text style={styles.name}>{teacher.name}</Text>
                    <Text style={styles.subject}>{teacher.subject}</Text>
                </View>

            </View>

            <Text style={styles.bio} >{teacher.bio}
                {'\n'}{'\n'}
            </Text>
            <View style={styles.footer}>
                <Text style={styles.priceValue}>
                    Preço/hora{'   '}
                    <Text style={styles.priceValue}>{teacher.cost}</Text>
                </Text>

                <View style={styles.buttonsContainer}>
                    <RectButton
                        onPress={handleToggleFavorite}
                        style={[
                            styles.favoriteButton,
                            isFavorited ? styles.favorited : {},
                        ]}
                    >
                        {isFavorited
                            ? <Image source={unfavoriteIcon} />
                            : <Image source={heartOutlineIcon} />
                        }



                    </RectButton>
                    <RectButton onPress={handleLinkToWhatsapp} style={styles.contactButton}>
                        <Image source={whatsappIcon} />
                        <Text style={styles.contactButtonText}>Entrar em contato</Text>
                    </RectButton>
                </View>
            </View>
        </View>
    );
}

export default TeacherItem;