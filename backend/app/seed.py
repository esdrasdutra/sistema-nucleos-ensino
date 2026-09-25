import os
from datetime import datetime, timedelta

from app.core.database import Base, SessionLocal, engine
from app.models import (
    Aluno,
    Curso,
    Matricula,
    Materia,
    Modulo,
    NotaModulo,
    Polo,
    Presenca,
    SessaoAula,
    Turma,
    Usuario,
)


def seed_database():
    environment = os.getenv("ENVIRONMENT", "local")
    if environment == "production":
        print("Seed bloqueada em produção para evitar DROP/TABLE reset destrutivo.")
        return

    print("Inicializando banco de dados e semeando dados de teste...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = Usuario(
            nome="Pr. Marcos Silva (Super Admin)",
            email="admin@denomimacao.org",
            senha_hash="hash123",
            perfil="ADMIN"
        )
        gestor_sp = Usuario(
            nome="Pr. Carlos Eduardo",
            email="carlos.sp@denomimacao.org",
            senha_hash="hash123",
            perfil="GESTOR_NUCLEO"
        )
        gestor_rj = Usuario(
            nome="Dra. Ana Paula",
            email="ana.rj@denomimacao.org",
            senha_hash="hash123",
            perfil="GESTOR_NUCLEO"
        )
        gestor_bh = Usuario(
            nome="Pr. Roberto Lima",
            email="roberto.bh@denomimacao.org",
            senha_hash="hash123",
            perfil="GESTOR_NUCLEO"
        )
        gestor_cwb = Usuario(
            nome="Profa. Carla Souza",
            email="carla.cwb@denomimacao.org",
            senha_hash="hash123",
            perfil="GESTOR_NUCLEO"
        )

        db.add_all([admin, gestor_sp, gestor_rj, gestor_bh, gestor_cwb])
        db.commit()

        polo_sp = Polo(
            nome="Núcleo Central São Paulo",
            codigo="NUCLEO-SP-01",
            cidade="São Paulo",
            estado="SP",
            responsavel_id=gestor_sp.id,
            status="ATIVO"
        )
        polo_rj = Polo(
            nome="Núcleo Rio de Janeiro - Zona Sul",
            codigo="NUCLEO-RJ-02",
            cidade="Rio de Janeiro",
            estado="RJ",
            responsavel_id=gestor_rj.id,
            status="ATIVO"
        )
        polo_bh = Polo(
            nome="Núcleo Belo Horizonte",
            codigo="NUCLEO-BH-03",
            cidade="Belo Horizonte",
            estado="MG",
            responsavel_id=gestor_bh.id,
            status="ATIVO"
        )
        polo_cwb = Polo(
            nome="Núcleo Curitiba",
            codigo="NUCLEO-CWB-04",
            cidade="Curitiba",
            estado="PR",
            responsavel_id=gestor_cwb.id,
            status="ATIVO"
        )

        db.add_all([polo_sp, polo_rj, polo_bh, polo_cwb])
        db.commit()

        materia1 = Materia(nome="Teologia Bíblica", codigo="TB-01", descricao="Estudo da Palavra de Deus e hermenêutica básica", status="ATIVA")
        materia2 = Materia(nome="Liderança Ministerial", codigo="LM-02", descricao="Prática de liderança e cuidado pastoral", status="ATIVA")
        materia3 = Materia(nome="História da Igreja", codigo="HI-03", descricao="Trajetória histórica e identidade da igreja", status="ATIVA")
        db.add_all([materia1, materia2, materia3])
        db.commit()

        curso = Curso(
            nome="Bacharel em Teologia Prática e Liderança",
            descricao="Formação ministerial completa focada em interpretação bíblica, liderança de núcleos e teologia aplicada.",
            carga_horaria=180
        )
        db.add(curso)
        db.commit()

        mod1 = Modulo(curso_id=curso.id, nome_modulo="Módulo I - Bibliologia e Hermenêutica", ordem=1, peso_nota=1.0)
        mod2 = Modulo(curso_id=curso.id, nome_modulo="Módulo II - Teologia Sistemática I", ordem=2, peso_nota=1.0)
        mod3 = Modulo(curso_id=curso.id, nome_modulo="Módulo III - História do Cristianismo", ordem=3, peso_nota=1.0)
        mod4 = Modulo(curso_id=curso.id, nome_modulo="Módulo IV - Homilética e Oratória", ordem=4, peso_nota=1.0)
        mod5 = Modulo(curso_id=curso.id, nome_modulo="Módulo V - Aconselhamento Pastoral", ordem=5, peso_nota=1.0)

        db.add_all([mod1, mod2, mod3, mod4, mod5])
        db.commit()

        turma_sp = Turma(
            polo_id=polo_sp.id,
            curso_id=curso.id,
            nome_turma="Turma Alpha SP - 2026",
            professor="Pr. Carlos Eduardo",
            dia_semana="Terça-feira",
            horario="19:30 - 21:30",
            status="EM_ANDAMENTO"
        )
        turma_rj = Turma(
            polo_id=polo_rj.id,
            curso_id=curso.id,
            nome_turma="Turma Beta RJ - 2026",
            professor="Dra. Ana Paula",
            dia_semana="Quinta-feira",
            horario="19:30 - 21:30",
            status="EM_ANDAMENTO"
        )
        turma_bh = Turma(
            polo_id=polo_bh.id,
            curso_id=curso.id,
            nome_turma="Turma Gamma BH - 2026",
            professor="Pr. Roberto Lima",
            dia_semana="Sábado",
            horario="14:00 - 17:00",
            status="EM_ANDAMENTO"
        )

        db.add_all([turma_sp, turma_rj, turma_bh])
        db.commit()

        lista_alunos_dados = [
            ("Gabriel Santos", "gabriel.santos@aluno.org", "(11) 98765-4321", polo_sp, turma_sp, "JOVEM"),
            ("Mariana Oliveira", "mariana.oliveira@aluno.org", "(11) 97654-3210", polo_sp, turma_sp, "JOVEM"),
            ("Lucas Ferreira", "lucas.ferreira@aluno.org", "(11) 96543-2109", polo_sp, turma_sp, "ADULTO"),
            ("Beatriz Mendes", "beatriz.mendes@aluno.org", "(11) 95432-1098", polo_sp, turma_sp, "JOVEM"),
            ("Felipe Rocha", "felipe.rocha@aluno.org", "(21) 98877-6655", polo_rj, turma_rj, "ADULTO"),
            ("Camila Ribeiro", "camila.ribeiro@aluno.org", "(21) 97766-5544", polo_rj, turma_rj, "JOVEM"),
            ("Thiago Martins", "thiago.martins@aluno.org", "(21) 96655-4433", polo_rj, turma_rj, "ADULTO"),
            ("Rafael Costa", "rafael.costa@aluno.org", "(31) 99988-7766", polo_bh, turma_bh, "ADULTO"),
            ("Amanda Silva", "amanda.silva@aluno.org", "(31) 98877-6655", polo_bh, turma_bh, "JOVEM"),
            ("Daniel Alves", "daniel.alves@aluno.org", "(31) 97766-5544", polo_bh, turma_bh, "ADULTO"),
        ]

        alunos_objetos = []
        for nome, email, fone, polo_obj, turma_obj, tipo in lista_alunos_dados:
            usr = Usuario(nome=nome, email=email, senha_hash="hash123", perfil="ALUNO")
            db.add(usr)
            db.commit()

            aln = Aluno(usuario_id=usr.id, nome=nome, email=email, telefone=fone, polo_id=polo_obj.id, tipo_aluno=tipo)
            db.add(aln)
            db.commit()

            mat = Matricula(aluno_id=aln.id, turma_id=turma_obj.id, status_matricula="ATIVO")
            db.add(mat)
            db.commit()

            alunos_objetos.append((aln, turma_obj))

        datas_aulas = ["2026-08-04", "2026-08-11", "2026-08-18", "2026-08-25", "2026-09-01"]
        for turma_obj in [turma_sp, turma_rj, turma_bh]:
            alunos_da_turma = [a for a, t in alunos_objetos if t.id == turma_obj.id]
            for idx, dt in enumerate(datas_aulas):
                sessao = SessaoAula(
                    turma_id=turma_obj.id,
                    data_aula=dt,
                    conteudo=f"Aula {idx + 1}: Estudo Dirigido e Prática Exegética"
                )
                db.add(sessao)
                db.commit()

                for aln in alunos_da_turma:
                    presente_val = True
                    if aln.nome in ["Lucas Ferreira", "Thiago Martins"] and idx == 2:
                        presente_val = False

                    pres = Presenca(sessao_id=sessao.id, aluno_id=aln.id, presente=presente_val)
                    db.add(pres)
                db.commit()

        modulos = [mod1, mod2, mod3]
        for aln, turma_obj in alunos_objetos:
            for mod in modulos:
                if aln.nome == "Gabriel Santos":
                    nota_val = 9.5 if mod.id == mod1.id else (8.8 if mod.id == mod2.id else 9.0)
                elif aln.nome == "Lucas Ferreira":
                    nota_val = 5.8 if mod.id == mod1.id else 6.2
                elif aln.nome == "Mariana Oliveira":
                    nota_val = 10.0 if mod.id == mod1.id else 9.7
                elif aln.nome == "Thiago Martins":
                    nota_val = 4.5 if mod.id == mod1.id else 5.0
                else:
                    nota_val = 8.5 if mod.id == mod1.id else 8.0

                nota_obj = NotaModulo(
                    aluno_id=aln.id,
                    turma_id=turma_obj.id,
                    modulo_id=mod.id,
                    nota=nota_val,
                    observacoes="Excelente engajamento nas discussões de aula." if nota_val >= 8.0 else "Recomendada revisão do material complementar."
                )
                db.add(nota_obj)
        db.commit()

        print("Seed concluído com sucesso!")
    except Exception as exc:
        db.rollback()
        print(f"Erro ao semear banco de dados: {exc}")
        raise exc
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
