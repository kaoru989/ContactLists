import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { BlockedUserListItem } from "../components/BlockedUserItem";
import { Contact } from "@/utility/api";

declare global {
  var blockedUserData: Map<string, Contact>;
}

globalThis.blockedUserData = new Map<string, Contact>();

export default function BlockedUsersScreen() {
  const [blockedUsers, setBlockedUsers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const fetchedBlockedUsers: Contact[] = Array.from(globalThis.blockedUserData.values());
        console.log("Fetched Blocked Users:", fetchedBlockedUsers);
        setBlockedUsers(fetchedBlockedUsers);
        setLoading(false);
        setError(null);
      } catch (e) {
        setLoading(false);
        setError("Failed to load blocked users.");
      }
    }, 2000);
  }, []);

  useEffect(() => {
    try {
      const fetchedBlockedUsers: Contact[] = Array.from(globalThis.blockedUserData.values());
      console.log("Fetched Blocked Users on Load:", fetchedBlockedUsers);
      setBlockedUsers(fetchedBlockedUsers);
      setLoading(false);
      setError(null);
    } catch (e) {
      setLoading(false);
      setError("Failed to load blocked users.");
    }
  }, []);

  const renderBlockedUser = ({ item }: { item: Contact }) => {
    const { name, picture, phone } = item;

    return (
      <BlockedUserListItem
        name={`${name.title} ${name.first} ${name.last}`}
        avatar={{ uri: picture.medium }}
        phone={phone}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={"blue"} size={"large"} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.phone}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
  },
  listContent: {
    paddingVertical: 10,
  },
});
