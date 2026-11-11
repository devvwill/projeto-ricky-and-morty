import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { getPlanets } from "@/services/rickyAndMorttService";
import type { Planets } from "@/types/planets";

import PlanetParticles from "@/components/PlanetParticles";

export default function TelaInicial() {
  const [planets, setPlanets] = useState<Planets[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function loadPlanets() {
      try {
        const dados = await getPlanets();

        if (ativo) {
          setPlanets(dados);
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os planetas.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    loadPlanets();

    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.text}>Carregando planetas...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlanetParticles planets={planets} />

      <View style={styles.header}>
        <Text style={styles.title}>Rick and Morty</Text>

        <Text style={styles.subtitle}>
          {planets.length} planetas encontrados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080b16",
  },

  center: {
    flex: 1,
    backgroundColor: "#080b16",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  header: {
    position: "absolute",
    top: 65,
    left: 24,
    zIndex: 2,
  },

  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
  },

  text: {
    color: "#ffffff",
    fontSize: 16,
  },
});
