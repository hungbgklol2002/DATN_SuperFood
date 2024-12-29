package com.web.repository;

import com.web.entity.Category;
import com.web.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long> {

    @Query("select p from Product p where p.name = ?1 and p.deleted <> true")
    public Optional<Product> findByName(String name);

    @Query("select p from Product p where p.id = ?1 and p.deleted <> true")
    public Optional<Product> findById(Long id);

    @Query("select p from Product p where p.deleted <> true")
    public Page<Product> findAll(Pageable pageable);

    @Query("select p from Product p where p.name like ?1 and p.deleted <> true")
    public Page<Product> findAllByParam(String param, Pageable pageable);

    @Query("select p from Product p where p.name like ?1 and p.category.id = ?2 and p.deleted <> true")
    Page<Product> findByParamAndCate(String s, Long categoryId, Pageable pageable);

    @Query("select p from Product p where p.category.id= ?1 and p.id <> ?2 and p.deleted <> true")
    public List<Product> findByCategoryAndId(Long categoryId, Long id);

    @Query("select p from Product p where p.category.id= ?1 and p.deleted <> true")
    public Page<Product> findByCategory(Long categoryId, Pageable pageable);

    @Query("select p from Product p where (p.name like ?1 or p.category.name like ?1) and p.deleted <> true")
    public Page<Product> findByParam(String param, Pageable pageable);

    @Query("select p from Product p where (p.name like ?1 or p.category.name like ?1) and p.price >= ?2 and p.price <= ?3 and p.deleted <> true")
    public Page<Product> searchFull(String param, Double small, Double large, Pageable pageable);

    @Query("select p from Product p where (p.name like ?1 or p.category.name like ?1) and p.price >= ?2 and p.price <= ?3 and p.category.id = ?4 and p.deleted <> true")
    public Page<Product> searchFull(String param, Double small, Double large, Long cate, Pageable pageable);

    @Query(value = "SELECT p.* FROM product p WHERE p.deleted <> true ORDER BY p.quantity_sold DESC LIMIT 5", nativeQuery = true)
    public List<Product> sanPhamBanChay();

    @Query("select p from Product p where p.deleted <> true")
    List<Product> findAll();
}
