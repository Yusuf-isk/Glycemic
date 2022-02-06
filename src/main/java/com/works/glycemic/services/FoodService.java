package com.works.glycemic.services;

import com.works.glycemic.config.AuditAwareConfig;
import com.works.glycemic.models.Foods;
import com.works.glycemic.repositories.FoodRepository;
import com.works.glycemic.utils.REnum;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FoodService {

    final FoodRepository fRepo;
    final AuditAwareConfig auditAwareConfig;
    public FoodService(FoodRepository fRepo, AuditAwareConfig auditAwareConfig) {
        this.fRepo = fRepo;
        this.auditAwareConfig = auditAwareConfig;
    }


    // food save
    public Foods foodsSave( Foods foods ) {
        Optional<Foods> oFoods = fRepo.findByNameEqualsIgnoreCase(foods.getName());
        if (oFoods.isPresent() ) {
            return null;
        }else {
            foods.setEnabled(false);
            return fRepo.save(foods);
        }
    }

    // food list
    public List<Foods> foodsList() {
        return fRepo.findAll();
    }


    // user food list
    public List<Foods> userFoodList() {
        Optional<String> oUserName = auditAwareConfig.getCurrentAuditor();
        if (oUserName.isPresent() ) {
            return fRepo.findByCreatedByEqualsIgnoreCase( oUserName.get() );
        }else {
            return new ArrayList<Foods>();
        }

    }


    @Transactional
    public Map<REnum, Object> foodDelete(long gid) {
        Map<REnum, Object> hm = new LinkedHashMap<>();
        hm.put(REnum.status, false);
        Optional<String> oUserName = auditAwareConfig.getCurrentAuditor();
        if ( oUserName.isPresent() ) {
            try {
                String userName = oUserName.get();
                if ( auditAwareConfig.roles().contains("ROLE_admin") ) {
                    // admin food delete
                    fRepo.deleteById(gid);
                    hm.put(REnum.status, true);
                    hm.put(REnum.message, "Silme işlemi başarılı");
                }else {
                    // user food delete
                    Optional<Foods> oFoods = fRepo.findByCreatedByEqualsIgnoreCaseAndGidEquals(userName, gid);
                    if ( oFoods.isPresent() ) {
                        // user delete gid
                        fRepo.deleteById(gid);
                        hm.put(REnum.status, true);
                        hm.put(REnum.message, "Silme işlemi başarılı");
                    }else {
                        hm.put(REnum.message, "Bu ürün size ait değil");
                    }
                }
            }catch (Exception ex) {
                hm.put(REnum.message, "Silme işlemi sırasında bir hata oluştu veya id hatalı!");
            }
        }else {
            hm.put(REnum.message, "Bu işlem için yetkiniz yok!");
        }
        hm.put(REnum.result, gid);
        return hm;
    }

    //user update food
    public Map<REnum, Object> userUpdateFood(Foods food) {
        Map<REnum, Object> hm = new LinkedHashMap<>();

        hm.put(REnum.status, true);
        hm.put(REnum.message, "Ürün başarıyla güncellendi");
        hm.put(REnum.result, "id: " + food.getGid());


        Optional<String> oUserName = auditAwareConfig.getCurrentAuditor();

        if (oUserName.isPresent()) {
            String userName = oUserName.get();
            try {
                Foods userFood = fRepo.findById(food.getGid()).get();

                //admin food update
                if (auditAwareConfig.roles().contains("ROLE_admin")) {
                    userFood.setCid(food.getCid());
                    userFood.setName(food.getName());
                    userFood.setGlycemicindex(food.getGlycemicindex());
                    userFood.setImage(food.getImage());
                    userFood.setSource(food.getSource());
                    userFood.setEnabled(food.isEnabled());

                    hm.put(REnum.result, fRepo.save(userFood));
                }
                else {

                    //user food update
                    Optional<Foods> oFood = fRepo.findByCreatedByEqualsIgnoreCaseAndGidEquals(userName,food.getGid());
                    if (oFood.isPresent()) {
                        userFood.setCid(food.getCid());
                        userFood.setName(food.getName());
                        userFood.setGlycemicindex(food.getGlycemicindex());
                        userFood.setImage(food.getImage());
                        userFood.setSource(food.getSource());

                        hm.put(REnum.result, fRepo.save(userFood));
                    }
                    else {
                        hm.put(REnum.status, false);
                        hm.put(REnum.message, "Güncellemek istediğiniz ürün size ait değil!");
                    }
                }
            }
            catch (Exception ex) {
                hm.put(REnum.status, false);
                hm.put(REnum.message, "Update işlemi sırasında bir hata oluştu!");
            }

        } else {
            hm.put(REnum.status, false);
            hm.put(REnum.message, "Bu işleme yetkiniz yok!");
        }
        return hm;
    }

}
