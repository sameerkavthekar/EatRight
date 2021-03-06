import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { TextInput, Button } from "react-native-paper";
import { COLORS, FONTS, SIZES } from "../constants";
import { RadioButton } from "react-native-paper";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from "react-native-vector-icons/FontAwesome5";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import useAuth from "../hooks/useAuth";
import { useIsFocused } from "@react-navigation/native";

const GoalScreen = () => {
  const { user } = useAuth();
  const [goalName, setGoalName] = useState("");
  const [currentGoals, setCurrentGoals] = useState([]);
  const [calories, setCalories] = useState(null);
  const [duration, setDuration] = useState("daily");
  const isFocused = useIsFocused();

  useEffect(async () => {
    try {
      console.log(user.email);
      const res = await axios.get(
        `${global.config.host}/api/goals/all-goals/${user.email}`
      );
      setCurrentGoals(res.data.arr);
      console.log(res.data.arr);
    } catch (error) {
      console.log(error);
    }
  }, [isFocused]);

  const handleSubmit = async () => {
    // setCurrentGoals(()=>)
    console.log(user);
    let res = await axios.post(`${global.config.host}/api/goals/add-goal`, {
      duration_type: duration,
      email: user.email,
      activity_type: goalName,
      final_goal: calories,
    });
    // console.log(res.data.msg);
    let newGoal = res.data.msg;
    setCurrentGoals((prev) => [...prev, newGoal]);
    Alert.alert(`Goal Set Successfully`);

    setGoalName(null);
    setDuration(null);
    setCalories(null);
  };
  const handleRedeem = async (goal_id, duration_type, activity_type) => {
    await axios.post(`${global.config.host}/api/goals/delete-goal`, {
      email: user.email,
      goal_id,
    });
    const points = duration_type === "weekly" ? 400 : 50;
    await axios.post(`${global.config.host}/api/awards/add-reward`, {
      email: user.email,
      duration_type,
      points,
      activity_type,
    });
    let tmpArr = currentGoals;
    tmpArr = tmpArr.filter((elem) => elem._id !== goal_id);
    setCurrentGoals(tmpArr);
  };
  const GoalCard = ({
    name,
    duration,
    calories,
    current,
    final_amount,
    goal_id,
    date,
  }) => {
    let percent = Math.round(
      (parseInt(current) * 100) / parseInt(final_amount)
    );
    console.log(current, final_amount, percent);
    let new_date = new Date(date).getTime();
    let next_day = new_date + 1 * 24 * 60 * 60 * 1000;
    let curr_date = new Date("2 February 2022").getTime();

    return (
      <View
        style={{
          borderColor: COLORS.primary,
          borderWidth: 2,
          justifyContent: "space-evenly",
          borderTopRightRadius: 30,
          padding: 15,
          borderBottomLeftRadius: 30,
          backgroundColor: "#3d5875",
          margin: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 24,
                marginBottom: 10,
                color: COLORS.primary,
              }}
            >
              {name}
            </Text>
            <Text style={{ color: COLORS.white }}>
              {duration}
              {"   "} <Icon name="fire" size={15} color={COLORS.white} />{" "}
              {calories}
            </Text>
          </View>
          <AnimatedCircularProgress
            size={60}
            width={5}
            fill={percent}
            duration={600}
            tintColor={COLORS.primary}
            lineCap="round"
            backgroundColor="#333"
            //   style={{
            //     borderWidth: 1,
            //     borderColor: "#fff",
            //   }}
          >
            {() => <Text style={{ color: COLORS.white }}>{percent} %</Text>}
          </AnimatedCircularProgress>
        </View>
        {curr_date > next_day && current <= calories && (
          <Button
            style={{
              marginTop: 15,
              backgroundColor: "#f1c40f",
              width: "55%",
              alignSelf: "center",
            }}
            mode="contained"
            onPress={() => handleRedeem(goal_id, duration, name)}
          >
            Redeem
          </Button>
        )}
      </View>
    );
  };
  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={{ padding: 40 }}>
        <TextInput
          label="Goal Name"
          value={goalName}
          mode="flat"
          style={{
            width: "100%",
            alignSelf: "center",
          }}
          onChangeText={(text) => setGoalName(text)}
        />
        <TextInput
          label="Calories"
          keyboardType="numeric"
          placeholder="Enter target calories"
          value={calories}
          mode="flat"
          style={{
            width: "100%",
            alignSelf: "center",
            marginTop: 20,
          }}
          onChangeText={(text) => setCalories(text)}
        />
        <Text style={styles.formText}>Select Duration</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setDuration(newValue)}
          value={duration}
          uncheckedColor={"#fff"}
        >
          <View style={styles.radioBtn}>
            <Text style={styles.formText}>Daily</Text>
            <RadioButton value="daily" />
          </View>
          <View style={styles.radioBtn}>
            <Text style={styles.formText}>Weekly</Text>
            <RadioButton value="weekly" />
          </View>
        </RadioButton.Group>
        <Button
          icon="target"
          mode="contained"
          style={{
            margin: 20,
            paddingVertical: 10,
            width: "50%",
            alignSelf: "center",
          }}
          onPress={handleSubmit}
        >
          Set Goal
        </Button>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              borderBottomColor: "#777",
              marginBottom: 10,
            }}
          >
            Current Goals
          </Text>

          <FlatList
            scrollEnabled={false}
            data={currentGoals}
            keyExtractor={(item) => item._id}
            inverted={true}
            renderItem={({ item }) => {
              return (
                <GoalCard
                  duration={item.duration_type}
                  name={item.activity_type}
                  calories={item.final_goal}
                  current={item.current_amount}
                  //   current={520}
                  goal_id={item._id}
                  final_amount={item.final_goal}
                  date={item.date}
                />
              );
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default GoalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    // backgroundColor: "white",
  },
  formText: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
    borderBottomColor: "#777",
  },
  radioBtn: {
    flexDirection: "row",
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 5,
    width: "40%",
    justifyContent: "center",
    borderColor: COLORS.white,
  },
});
