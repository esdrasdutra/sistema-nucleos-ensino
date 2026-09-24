import unittest

from fastapi.testclient import TestClient

import main
from seed import seed_database


class BackendRulesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()

    def test_gestor_nao_pode_criar_turma_em_outro_nucleo(self):
        client = TestClient(main.app)

        payload = {
            "polo_id": 2,
            "curso_id": 1,
            "nome_turma": "Turma Fora do Núcleo",
            "professor": "Pr. Teste",
            "dia_semana": "Quarta-feira",
            "horario": "19:00 - 21:00",
        }

        response = client.post(
            "/api/v1/turmas",
            json=payload,
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("núcleo", response.json()["detail"].lower())

    def test_crud_materias_deve_existir_e_restringir_admin(self):
        client = TestClient(main.app)

        response = client.get(
            "/api/v1/materias",
            headers={"X-User-Role": "ADMIN"},
        )
        self.assertEqual(response.status_code, 200)

        forbidden = client.get(
            "/api/v1/materias",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_criacao_de_nucleo_exige_aceite_dos_termos(self):
        client = TestClient(main.app)

        payload = {
            "nome": "Núcleo Teste Termos",
            "codigo": "NUCLEO-TERMOS-99",
            "cidade": "Campinas",
            "estado": "SP",
            "responsavel_id": 2,
            "status": "ATIVO",
            "aceitou_termos": False,
        }

        response = client.post(
            "/api/v1/polos",
            json=payload,
            headers={"X-User-Role": "ADMIN"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("termos", response.json()["detail"].lower())

    def test_historico_do_aluno_consolida_presenca_e_notas(self):
        client = TestClient(main.app)

        response = client.get(
            "/api/v1/historico-aluno/1",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("historico", response.json())
        self.assertIn("presenca_total", response.json()["historico"][0])

    def test_aluno_deve_informar_se_ja_e_jovem_ou_adulto(self):
        client = TestClient(main.app)

        jovem_payload = {
            "nome": "Aluno Jovem Teste",
            "email": "jovem.teste@aluno.org",
            "telefone": "(11) 91234-5678",
            "polo_id": 1,
            "tipo_aluno": "JOVEM",
        }

        adulto_payload = {
            "nome": "Aluno Adulto Teste",
            "email": "adulto.teste@aluno.org",
            "telefone": "(11) 99876-5432",
            "polo_id": 1,
            "tipo_aluno": "ADULTO",
        }

        jovem_response = client.post(
            "/api/v1/alunos",
            json=jovem_payload,
            headers={"X-User-Role": "ADMIN"},
        )
        adulto_response = client.post(
            "/api/v1/alunos",
            json=adulto_payload,
            headers={"X-User-Role": "ADMIN"},
        )

        self.assertEqual(jovem_response.status_code, 201)
        self.assertEqual(jovem_response.json()["tipo_aluno"], "JOVEM")
        self.assertEqual(adulto_response.status_code, 201)
        self.assertEqual(adulto_response.json()["tipo_aluno"], "ADULTO")

    def test_gestor_nao_pode_ver_boletim_de_aluno_fora_do_seu_nucleo(self):
        client = TestClient(main.app)

        response = client.get(
            "/api/v1/portal-aluno/1",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "2"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("núcleo", response.json()["detail"].lower())

    def test_gestor_pode_excluir_apenas_turmas_do_seu_nucleo(self):
        client = TestClient(main.app)

        created = client.post(
            "/api/v1/turmas",
            json={
                "polo_id": 1,
                "curso_id": 1,
                "nome_turma": "Turma Exclusão Própria",
                "professor": "Prof. Teste",
                "dia_semana": "Segunda-feira",
                "horario": "18:00 - 20:00",
            },
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )
        self.assertEqual(created.status_code, 201)
        turma_id = created.json()["id"]

        allowed = client.delete(
            f"/api/v1/turmas/{turma_id}",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )
        self.assertEqual(allowed.status_code, 200)

        outsider = client.post(
            "/api/v1/turmas",
            json={
                "polo_id": 2,
                "curso_id": 1,
                "nome_turma": "Turma Fora do Núcleo",
                "professor": "Prof. Teste",
                "dia_semana": "Quinta-feira",
                "horario": "19:00 - 21:00",
            },
            headers={"X-User-Role": "ADMIN"},
        )
        self.assertEqual(outsider.status_code, 201)

        blocked = client.delete(
            f"/api/v1/turmas/{outsider.json()['id']}",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )
        self.assertEqual(blocked.status_code, 403)

    def test_gestor_nao_pode_criar_aluno_fora_do_seu_nucleo(self):
        client = TestClient(main.app)

        response = client.post(
            "/api/v1/alunos",
            json={
                "nome": "Aluno Fora do Núcleo",
                "email": "fora.nucleo@aluno.org",
                "telefone": "(11) 98765-4321",
                "polo_id": 2,
                "tipo_aluno": "ADULTO",
            },
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("núcleo", response.json()["detail"].lower())

    def test_gestor_nao_pode_atualizar_aluno_fora_do_seu_nucleo(self):
        client = TestClient(main.app)

        created = client.post(
            "/api/v1/alunos",
            json={
                "nome": "Aluno Admin Externo",
                "email": "admin.externo@aluno.org",
                "telefone": "(21) 98888-1122",
                "polo_id": 2,
                "tipo_aluno": "ADULTO",
            },
            headers={"X-User-Role": "ADMIN"},
        )
        self.assertEqual(created.status_code, 201)
        aluno_id = created.json()["id"]

        response = client.put(
            f"/api/v1/alunos/{aluno_id}",
            json={
                "nome": "Aluno Admin Externo Alterado",
                "email": "admin.externo@aluno.org",
                "telefone": "(21) 98888-1122",
                "polo_id": 2,
                "tipo_aluno": "JOVEM",
            },
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("núcleo", response.json()["detail"].lower())

    def test_gestor_nao_pode_excluir_aluno_fora_do_seu_nucleo(self):
        client = TestClient(main.app)

        created = client.post(
            "/api/v1/alunos",
            json={
                "nome": "Aluno Excluído Externo",
                "email": "excluido.externo@aluno.org",
                "telefone": "(21) 97777-9988",
                "polo_id": 2,
                "tipo_aluno": "ADULTO",
            },
            headers={"X-User-Role": "ADMIN"},
        )
        self.assertEqual(created.status_code, 201)
        aluno_id = created.json()["id"]

        response = client.delete(
            f"/api/v1/alunos/{aluno_id}",
            headers={"X-User-Role": "GESTOR_NUCLEO", "X-User-Polo-ID": "1"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("núcleo", response.json()["detail"].lower())

    def test_listagem_de_alunos_pode_filtrar_por_tipo(self):
        client = TestClient(main.app)

        jovens = client.get(
            "/api/v1/alunos?tipo_aluno=JOVEM",
            headers={"X-User-Role": "ADMIN"},
        )
        adultos = client.get(
            "/api/v1/alunos?tipo_aluno=ADULTO",
            headers={"X-User-Role": "ADMIN"},
        )

        self.assertEqual(jovens.status_code, 200)
        self.assertEqual(adultos.status_code, 200)
        self.assertTrue(all(aluno["tipo_aluno"] == "JOVEM" for aluno in jovens.json()))
        self.assertTrue(all(aluno["tipo_aluno"] == "ADULTO" for aluno in adultos.json()))


if __name__ == "__main__":
    unittest.main()
