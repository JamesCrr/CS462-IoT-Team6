import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";

interface Item {
  id: string;
  text: string;
}

interface ItemListProps {
  items: Item[];
  addItem: () => void;
  removeItem: (id: string) => void;
  newItem: string;
  setNewItem: (text: string) => void;
  itemType: string;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  addItem,
  removeItem,
  newItem,
  setNewItem,
  itemType,
}) => {
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text style={styles.text}>{item.text}</Text>
      <Button title="Remove" onPress={() => removeItem(item.id)} />
    </View>
  );

  return (
    <View>
      <Text style={styles.text}>Add {itemType}</Text>
      <TextInput
        style={styles.input}
        value={newItem}
        onChangeText={setNewItem}
        placeholder={`Enter new " + ${itemType}`}
      />
      <Button title={`Add ${itemType}`} onPress={addItem} />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    color: "white",
    // Add more styles as needed
  },
  input: {
    height: 40,
    borderColor: "gray",
    color: "white",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default ItemList;
