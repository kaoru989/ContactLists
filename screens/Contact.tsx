import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ContactListItem } from "../components/contactListItem";
import { Contact, fetchContacts } from "../utility/api";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";

declare global {
  var favoriteContacts: Set<string>;
  var blockedContacts: Set<string>;
}

globalThis.favoriteContacts = new Set<string>();
globalThis.blockedContacts = new Set<string>();

export default function ContactScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const keyExtractor = ({ phone }: { phone: string }) => phone;
  const isFocused = useIsFocused(); // Hook to determine if the screen is focused

  const swipeableRefs = useRef<{ [key: string]: Swipeable }>({});

  const onRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      fetchContacts()
        .then((fetchedContacts: Contact[]) => {
          const extendedContacts: Contact[] = fetchedContacts.map(
            (contact) => ({
              ...contact,
              favorite: globalThis.favoriteContacts.has(contact.phone),
              blocked: globalThis.blockedContacts.has(contact.phone),
            })
          );
          setContacts(extendedContacts);
          setLoading(false);
          setError(false);
        })
        .catch(() => {
          setLoading(false);
          setError(true);
        });
    }, 2000);
  }, []);

  useEffect(() => {
    fetchContacts()
      .then((fetchedContacts: Contact[]) => {
        const extendedContacts: Contact[] = fetchedContacts.map(
          (contact) => ({
            ...contact,
            favorite: globalThis.favoriteContacts.has(contact.phone),
            blocked: globalThis.blockedContacts.has(contact.phone),
          })
        );
        setRefreshing(false);
        setContacts(extendedContacts);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setRefreshing(false);
        setLoading(false);
        setError(true);
      });
  }, []);

  useEffect(() => {
    if (!isFocused) {
      // Reset swipeable components when the screen loses focus
      Object.values(swipeableRefs.current).forEach(swipeable => {
        swipeable.close();
      });
    }
  }, [isFocused]);

  const toggleFavorite = (phone: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.phone === phone
          ? { ...contact, favorite: !contact.favorite }
          : contact
      )
    );

    if (globalThis.favoriteContacts.has(phone)) {
      globalThis.favoriteContacts.delete(phone);
    } else {
      globalThis.favoriteContacts.add(phone);
    }
  };

  const blockUser = (phone: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.phone === phone
          ? { ...contact, blocked: true }
          : contact
      )
    );

    globalThis.blockedContacts.add(phone);

    // Navigate to BlockedScreens
    navigation.navigate('BlockedScreens'); // Update this with the correct screen name
  };

  const renderLeftActions = (contact: Contact) => {
    return (
      <View style={styles.blockAction}>
        <Text style={styles.blockActionText}>Block</Text>
      </View>
    );
  };

  const renderRightActions = (contact: Contact) => {
    return (
      <View style={styles.favoriteAction}>
        <Text style={styles.favoriteActionText}>
          {contact.favorite ? "Unfavorite" : "Favorite"}
        </Text>
      </View>
    );
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const { name, picture, phone } = item;

    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={(ref) => {
            if (ref) swipeableRefs.current[phone] = ref;
          }}
          renderLeftActions={() => renderLeftActions(item)}
          onSwipeableLeftOpen={() => blockUser(phone)}
          renderRightActions={() => renderRightActions(item)}
          onSwipeableRightOpen={() => toggleFavorite(phone)}
        >
          <ContactListItem
            name={name ? `${name.title}.${name.first} ${name.last}` : ""}
            avatar={{ uri: picture.medium }}
            phone={phone}
            favorite={item.favorite}
            onPress={() => {
              navigation.navigate("Call", {
                callerName: name
                  ? `${name.title}.${name.first} ${name.last}`
                  : "",
                callerNumber: phone,
                avatar: picture.medium,
                navigation,
              });
            }}
            onLongPress={() => navigation.navigate("Profile", { contact: item })}
          />
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        color={"blue"}
        size={"large"}
        style={styles.loadingIndicator}
      />
    );
  }

  if (error) {
    return <Text>Error</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    justifyContent: "center",
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blockAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    width: 100,
  },
  blockActionText: {
    color: "white",
  },
  favoriteAction: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 20,
    width: 100,
  },
  favoriteActionText: {
    color: "white",
  },
});
