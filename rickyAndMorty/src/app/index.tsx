import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { getPlanets } from "@/services/rickyAndMorttService";
import type { Planets } from "@/types/planets";

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

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 60 }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Planetas
      </Text>

      {carregando && <Text>Carregando...</Text>}

      {erro !== "" && <Text>{erro}</Text>}

      {planets.map((planets) => (
        <View key={planets.id} style={{ marginBottom: 16 }}>
          <Text>{planets.name}</Text>
          <Text>{planets.dimension}</Text>
          <Text>{planets.created}</Text>
          <Text>{planets.residents.length}</Text>
          <Text>{planets.type} </Text>
        </View>
      ))}
    </ScrollView>
  );
}